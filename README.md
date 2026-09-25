# WildRoutes API

WildRoutes is a REST API for tours, reviews, and bookings. It uses PostgreSQL and Prisma to enforce data integrity, and separates HTTP handling, business rules, and database access into controllers, services, and repositories.

## What is implemented

- JWT registration and login, with `USER` and `ADMIN` roles.
- Tour CRUD, difficulty filtering, and paginated listing.
- Reviews with author-only updates and deletion, and one review per user per tour.
- Bookings with user and admin listings, and one booking per user per tour.
- Admin category creation and public category listing. The `TourCategory` join table exists in the schema; category assignment is not exposed through an API endpoint.
- Request validation with Zod, intentional API errors, and integration tests against a separate database.

## Tech stack and structure

Node.js 22, TypeScript, Express 5, PostgreSQL, Prisma, Zod, Vitest, and Docker Compose.

Requests flow through **controller → service → repository → database**. Controllers handle HTTP and validate request input. Services enforce business rules and map known database failures to API errors. Repositories contain Prisma queries and select the fields returned to callers. The [Prisma schema](prisma/schema.prisma) and migrations define persistent constraints.

## API endpoints

| Area       | Endpoints                                                                                                          | Access and behavior                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Health     | `GET /health`                                                                                                      | Public; returns a basic process response. It does not check database readiness. |
| Auth       | `POST /auth/register`, `POST /auth/login`                                                                          | Public; return a user and JWT.                                                  |
| Auth       | `GET /auth/me`                                                                                                     | Authenticated; returns the token's user ID and role.                            |
| Tours      | `GET /tours`, `GET /tours/:id`                                                                                     | Public; list supports `page`, `limit`, and `difficulty`.                        |
| Tours      | `POST /tours`, `PATCH /tours/:id`, `DELETE /tours/:id`                                                             | Admin only. Deleting a tour with related records returns `409 Conflict`.        |
| Reviews    | `GET /tours/:tourId/reviews`                                                                                       | Public; paginated with `page` and `limit`.                                      |
| Reviews    | `POST /tours/:tourId/reviews`, `PATCH /tours/:tourId/reviews/:reviewId`, `DELETE /tours/:tourId/reviews/:reviewId` | Authenticated; users can update or delete only their own reviews.               |
| Bookings   | `POST /tours/:tourId/bookings`, `GET /bookings/me`                                                                 | Authenticated; users create a booking and list their own bookings.              |
| Bookings   | `GET /bookings`                                                                                                    | Admin only; paginated list of all bookings.                                     |
| Categories | `GET /categories`                                                                                                  | Public; lists categories alphabetically.                                        |
| Categories | `POST /categories`                                                                                                 | Admin only; creates a category.                                                 |

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

3. Generate the Prisma client, apply the existing migrations, and start the API:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

   The API listens on port 3000 by default. `GET http://localhost:3000/health` returns the basic health response.

To run both PostgreSQL and the API in containers, first apply the migrations from the host as above, then run `docker compose up --build`. The API container uses the database host and development credentials set in `docker-compose.yml`. Compose does not apply migrations automatically.

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

GitHub Actions installs dependencies, generates the Prisma client, migrates a fresh PostgreSQL test database, builds, lints, and runs both test suites on pushes to `main` and pull requests.

## Design and integrity decisions

- Database unique constraints prevent duplicate bookings and reviews for the same user and tour, even when requests race. Known unique constraint failures become `409 Conflict` responses.
- Category names have a normalized unique key, so a duplicate with different letter casing also returns `409 Conflict`.
- Restrictive foreign keys prevent a tour with reviews or bookings from being silently deleted; the API returns `409 Conflict`.
- Protected routes require a JWT. Admin-only actions are checked in middleware; review ownership is checked in the service.
- Unexpected errors return a generic `500` response rather than exposing database errors or stack traces to API clients.

## Container image security

After the test job passes, CI builds a local production image for `linux/amd64` and uses Docker Scout to fail on fixable Critical or High vulnerabilities outside the Node base image. The scan requires read-only Docker Hub credentials in the GitHub Actions secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_SCOUT_TOKEN`; CI does not push an image or deploy the app.

This gate does not establish that the entire image has no vulnerabilities. Base-image and unfixed findings need separate review, and the current `node:22-slim` base tag is mutable. A production release would need deliberate base-image updates and an immutable deployment image reference.
