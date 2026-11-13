# WildRoutes API

WildRoutes is a REST API for tours, reviews, and bookings. It uses PostgreSQL and Prisma to enforce data integrity, and separates HTTP handling, business rules, and database access into controllers, services, and repositories.

## What is implemented

- JWT registration and login, with `USER` and `ADMIN` roles.
- Tour CRUD, difficulty filtering, and paginated listing.
- Reviews with author-only updates and deletion, and one review per user per tour.
- Bookings with user and admin listings, and one booking per user per tour.
- Admin category creation and public category listing, plus admin-only category assignment to tours.
- Request validation with Zod, intentional API errors, and integration tests against a separate database.

## Tech stack and structure

Node.js 22, TypeScript, Express 5, PostgreSQL, Prisma, Zod, Vitest, and Docker Compose.

Requests flow through **controller → service → repository → database**. Controllers handle HTTP and validate request input. Services enforce business rules and map known database failures to API errors. Repositories contain Prisma queries and select the fields returned to callers. The [Prisma schema](prisma/schema.prisma) and migrations define persistent constraints.

## API endpoints

| Area       | Endpoints                                                                                                          | Access and behavior                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health     | `GET /health`                                                                                                      | Public liveness check; returns `200` without accessing PostgreSQL.                                                                                                |
| Health     | `GET /health/ready`                                                                                                | Public readiness check; returns `200` when the database is reachable, or `503` on failure, timeout, or shutdown.                                                  |
| Auth       | `POST /auth/register`, `POST /auth/login`                                                                          | Public; return a user and JWT. Rate limited per IP (login counts failed attempts, register counts every request); excess returns `429`.                           |
| Auth       | `GET /auth/me`                                                                                                     | Authenticated; returns the token's user ID and role.                                                                                                              |
| Tours      | `GET /tours`, `GET /tours/:id`                                                                                     | Public; list supports `page`, `limit`, and `difficulty`.                                                                                                          |
| Tours      | `POST /tours`, `PATCH /tours/:id`, `DELETE /tours/:id`                                                             | Admin only. Deleting a tour with related records returns `409 Conflict`.                                                                                          |
| Reviews    | `GET /tours/:tourId/reviews`                                                                                       | Public; paginated with `page` and `limit`.                                                                                                                        |
| Reviews    | `POST /tours/:tourId/reviews`, `PATCH /tours/:tourId/reviews/:reviewId`, `DELETE /tours/:tourId/reviews/:reviewId` | Authenticated; users can update or delete only their own reviews.                                                                                                 |
| Bookings   | `POST /tours/:tourId/bookings`, `GET /bookings/me`                                                                 | Authenticated; users create a booking and list their own bookings.                                                                                                |
| Bookings   | `GET /bookings`                                                                                                    | Admin only; paginated list of all bookings.                                                                                                                       |
| Categories | `GET /categories`                                                                                                  | Public; lists categories alphabetically.                                                                                                                          |
| Categories | `POST /categories`                                                                                                 | Admin only; creates a category.                                                                                                                                   |
| Categories | `POST /tours/:tourId/categories`                                                                                   | Admin only; assigns an existing category to a tour. Returns `404 Not Found` if the tour or category does not exist, and `409 Conflict` if it is already assigned. |

List endpoints for tours, reviews, and bookings default to page 1 with a limit of 10 and cap the limit at 100. Category listing is currently unpaginated.

## Run locally

You need Node.js 22, npm, and Docker with Docker Compose. The Compose file supplies a local PostgreSQL database. Its password and the example JWT secret below are for local development only.

1. Install dependencies and start PostgreSQL:

   ```bash
   npm ci
   docker compose up -d postgres
   ```

2. Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgresql://postgres:passwordDev@localhost:5432/wildroutes_dev
   TEST_DATABASE_URL=postgresql://postgres:passwordDev@localhost:5432/wildroutes_test
   JWT_SECRET=replace-with-a-local-development-secret
   ```

   `.env` is ignored by Git. The test database URL is used only by integration tests.

   Runtime configuration is loaded and validated centrally at startup, then shared with the database setup, JWT utilities, and server. This allows the API to fail fast on invalid settings before accepting requests. `DATABASE_URL` must be a valid PostgreSQL connection URL, and `JWT_SECRET` must be a non-empty string. `PORT` is optional, defaults to 3000, and must be an integer from 1 to 65535. Invalid runtime settings stop startup with a configuration error. `TEST_DATABASE_URL` is required by the integration test setup and is not part of runtime configuration.

3. Generate the Prisma client, apply the existing migrations, and start the API:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

   The API listens on port 3000 by default. `GET http://localhost:3000/health` returns the basic health response.

To run both PostgreSQL and the API in containers, first apply the migrations from the host as above, then run `docker compose up --build`. The API container uses the database host and development credentials set in `docker-compose.yml`. Compose does not apply migrations automatically.

## Liveness and readiness

- `GET /health` is the liveness endpoint. It returns `200` with `{ "message": "Server is up and running" }` without accessing PostgreSQL.
- `GET /health/ready` is the readiness endpoint. It runs a database connectivity probe and returns `200` with `{ "status": "ready" }` on success, or `503` with `{ "status": "not_ready" }` on failure, timeout, or when shutdown has started. Database error details are not returned.

Readiness waits up to one second. Concurrent checks share one active database probe to prevent overlapping database operations from accumulating. The response deadline does not cancel the underlying probe; it remains shared until it settles. A permanently stalled probe therefore keeps subsequent checks unavailable until it settles or the process restarts.

A hosting platform can use liveness to decide whether to restart the process and readiness to decide whether to send it traffic. A database outage should make the instance unready without failing liveness. These endpoints do not configure hosting probes automatically, and a successful readiness check does not guarantee the next request will succeed.

Automated tests cover readiness service outcomes, its response deadline, shared probes, recovery after rejection, shutdown state, HTTP status mapping, and a successful database-backed readiness request. A manual process-level check verified that an unavailable database produces a safe readiness `503` while liveness remains `200`.

## Graceful shutdown

On `SIGINT` or `SIGTERM`, the API stops accepting new connections and allows active HTTP requests to finish before disconnecting Prisma. Repeated shutdown signals are ignored.

A fixed ten-second deadline covers HTTP draining and database cleanup. Successful cleanup cancels the deadline and allows the process to exit naturally with code `0`. HTTP-close or database-cleanup failures set exit code `1`; the deadline remains active as a fallback. If the deadline expires, the process logs the timeout and exits immediately with code `1`, potentially interrupting unfinished requests.

Manual process-level checks verified normal shutdown, successful completion of an active database-backed request, repeated-signal protection, stalled HTTP requests, and stalled or rejected Prisma cleanup. These checks are not part of the automated test suite.

## Tests and CI

Unit tests cover services, validators, and utilities without PostgreSQL:

```bash
npm run test:unit
```

Integration tests exercise the Express API with Supertest against `wildroutes_test`. After PostgreSQL is running, create that database once and apply the migrations to it:

```bash
docker compose exec postgres createdb -U postgres wildroutes_test
DATABASE_URL=postgresql://postgres:passwordDev@localhost:5432/wildroutes_test npx prisma migrate deploy
npm run test:integration
```

The integration setup maps `TEST_DATABASE_URL` to `DATABASE_URL` before importing the app, keeping these tests separate from the development database. `npm run lint` checks ESLint rules; `npx tsc --noEmit` checks TypeScript types.

At the last full run, `npm run test:unit` passed 116 tests in 13 files and `npm run test:integration` passed 92 tests in 7 files.

GitHub Actions installs dependencies, generates the Prisma client, migrates a fresh PostgreSQL test database, builds, lints, and runs both test suites on pushes to `main` and pull requests.

## Design and integrity decisions

- Database unique constraints prevent duplicate bookings and reviews for the same user and tour, even when requests race. Known unique constraint failures become `409 Conflict` responses.
- Category names have a normalized unique key, so a duplicate with different letter casing also returns `409 Conflict`.
- Restrictive foreign keys prevent a tour with reviews or bookings from being silently deleted; the API returns `409 Conflict`.
- Protected routes require a JWT. Admin-only actions are checked in middleware; review ownership is checked in the service.
- Unexpected errors return a generic `500` response rather than exposing database errors or stack traces to API clients.
- `Review` has an index on `(tourId, id)` to serve the reviews-by-tour list and count queries; see the [case study](#query-performance-case-study-reviews-by-tour).

## Security

Authentication routes are rate limited per client IP with `express-rate-limit`:

| Route                 | Limit             | What counts                                                                                                         |
| --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`    | 10 per 15 minutes | Failed attempts only. Successful logins do not count, so users behind a shared IP are not locked out by each other. |
| `POST /auth/register` | 10 per 15 minutes | Every request, including successful ones. Each registration costs a bcrypt hash and creates an account.             |

The two routes have separate counters. A limited request returns `429 Too Many Requests` with a `Retry-After` header (seconds until the window resets) and the standard error body. The limiter runs before the controller, so a blocked request never reaches the database or bcrypt. Each route has its own integration test file, because the counters live in process memory.

**Limitations.** Counters are held in memory, so they reset when the process restarts and are not shared between instances; running several instances would need a shared store. Limits are per IP, which slows guessing from one address but does not stop an attacker using many. `trust proxy` is not configured: behind a load balancer it must be set to the real number of proxies, or all users will share one IP or the client IP can be spoofed. This is deferred until deployment.

All responses carry security headers set by [Helmet](https://helmetjs.github.io/) with its default options, registered first so that 404 and error responses get them too. Helmet also removes `X-Powered-By`, so the framework is not advertised. The headers that matter most for a JSON API are `X-Content-Type-Options: nosniff` (browsers must trust the declared `Content-Type` instead of guessing) and `X-Frame-Options` (the API cannot be embedded in another site's frame). An integration test asserts the headers on a success, a `404` and a `401`.

**Header limitations.** Helmet's defaults have not been tuned: `Content-Security-Policy` matters for HTML and does little for a JSON API. `Strict-Transport-Security` is only honoured by browsers over HTTPS, so it is not verified until the service is deployed behind TLS. Helmet is defence in depth and does not replace input validation or CORS, which is not configured yet.

## Query performance case study: reviews by tour

**Question.** Listing reviews for a tour filters `Review` by `tourId`. PostgreSQL does not index foreign-key columns automatically, and the only existing indexes were the primary key and the unique `(userId, tourId)`, whose leading column is `userId`. Query plans were measured before any change was made.

**Method.** PostgreSQL 17 in Docker. A scratch database, `wildroutes_perf`, was seeded by [scripts/seed-perf.sql](scripts/seed-perf.sql) with 200 tours, 5,000 users and 100,000 reviews (exactly 500 per tour), followed by `ANALYZE`. Each statement ran three times with `EXPLAIN (ANALYZE, BUFFERS)`; the table shows the third run (warm cache) for tour 42. The SQL is the repository's `findReviewsByTour` and `countReviewsByTour` with literal values.

| Query                          | Before                                                     | After                                           | Buffers    | Execution      |
| ------------------------------ | ---------------------------------------------------------- | ----------------------------------------------- | ---------- | -------------- |
| List, page 1 (`LIMIT 10`)      | Index Scan on primary key; 1,854 rows discarded by filter  | Index Scan on `Review_tourId_id_idx`; no filter | 26 → 12    | 0.75 → 0.24 ms |
| List, last page (`OFFSET 490`) | Seq Scan + Sort                                            | Bitmap Index/Heap Scan + Sort                   | 1030 → 503 | 15.5 → 1.7 ms  |
| Count                          | Index Only Scan walking the whole `(userId, tourId)` index | Index Only Scan on the new index                | 372 → 4    | 7.3 → 0.48 ms  |

**Change.** Migration `20261104111653_add_review_tour_id_index` adds `@@index([tourId, id])`: the equality column first, the sort column second.

**Findings.**

- A composite index serves queries on its leading columns. `(userId, tourId)` cannot locate a tour's rows, so the count scanned the entire index (372 pages) instead of reading the 4 pages the new index needs.
- The planner chooses a plan per statement. Page 1 could stop early on the primary key; the last page needs 500 rows, so the planner switched to a full scan and sort.
- The new index does not remove the sort on the last page. Tour 42's 500 rows sit on 500 different table pages, so the planner estimated a bitmap scan plus an in-memory sort (cost about 897) as cheaper than an ordered index scan (about 1625).
- Buffers (pages touched) are more stable evidence than milliseconds.

**Limitations.** The dataset is about 8 MB and fully cached, so the ratios are more meaningful than the absolute times. The seed data is uniform, and results are single runs for one tour. The count's `Heap Fetches: 0` depends on an up-to-date visibility map. The write cost of the extra index was not measured. `OFFSET` pagination still scales with page depth; keyset pagination would be the follow-up.

**Reproduce.** Create the scratch database, apply the migrations and seed it:

```bash
docker compose exec postgres createdb -U postgres wildroutes_perf
DATABASE_URL=postgresql://postgres:passwordDev@localhost:5432/wildroutes_perf npx prisma migrate deploy
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d wildroutes_perf < scripts/seed-perf.sql
```

For the "before" measurements, run `DROP INDEX "Review_tourId_id_idx";` and `ANALYZE "Review";` in the scratch database only. The seed script refuses to run against any other database.

## Container image security

After the test job passes, CI builds a local production image for `linux/amd64` and uses Docker Scout to fail on fixable Critical or High vulnerabilities outside the Node base image. The scan requires read-only Docker Hub credentials in the GitHub Actions secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_SCOUT_TOKEN`; CI does not push an image or deploy the app.

This gate does not establish that the entire image has no vulnerabilities. Base-image and unfixed findings need separate review, and the current `node:22-slim` base tag is mutable. A production release would need deliberate base-image updates and an immutable deployment image reference.
