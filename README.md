# Wild Tours

A production-style backend API built to simulate a real-world tours platform, inspired by the concept of “Nasty Tours”, but redesigned with a relational database (PostgreSQL) and modern backend best practices.

This project was created as part of a personal refresh of modern backend engineering practices, focusing on:

- Clean architecture
- SQL & ORM-based data modeling
- Performance-aware API design
- Security & production readiness

## Tech Stack

- Node.js – Runtime
- Express.js – REST API framework
- PostgreSQL – Relational database
- Prisma ORM – Type-safe database access & migrations
- Docker – Containerized development environment

## Project Goals

- Real-world backend architecture patterns\* Asynchronous JavaScript: Implemented the fundamentals of promises and modern async/await syntax for handling asynchronous code.
- Transition from NoSQL mindset → relational modeling
- Proper use of ORM without performance pitfalls
- Implementation of security best practices
- Awareness of N+1 query problems and optimizations

### Responsibilities

**Controller**

- Handles HTTP layer (req/res)
- Delegates logic to services

**Service**

- Contains business logic
- Handles validation of business rules
- Coordinates multiple repositories

**Repository**

- Handles all database access via Prisma
- Encapsulates query logic
- Controls data fetching strategy (select/include)

---

## Data Modeling (PostgreSQL)

The system is designed using a **normalized relational schema**.

### Core Entities

- `User`
- `Tour`
- `Booking`
- `Review`
- `Category`
- `TourCategory` (many-to-many)
- `StartLocation`
- `TourLocation`

### Key Concepts

- Foreign key relationships
- Join tables for many-to-many relations
- Composite constraints
- Indexed columns for performance
- Data integrity rules (e.g. `priceDiscount < price`)

---

## Authentication & Authorization

### Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Secure login/signup flows

### Authorization

Role-based access control (RBAC)

Roles:

- `user`
- `guide`
- `lead-guide`
- `admin`

### Protection Features

- Route protection middleware
- Role restriction (`restrictTo`)
- Ownership checks at service level

---

## Security Features

- `helmet` – secure HTTP headers
- `cors` – configurable origin control
- `rate limiting` – protection against abuse
- Request body size limits
- Input validation & sanitization
- Safe error responses (no stack traces in production)

---

## Core Features

### Tours

- CRUD operations
- Filtering
- Sorting
- Pagination
- Field limiting

### Reviews

- Users can review tours
- Optional constraint: one review per user per tour

### Bookings

- Create booking
- View own bookings
- Admin access to all bookings

---

## Performance Considerations

Special focus was given to avoiding common ORM pitfalls.

### N+1 Problem Prevention

- Controlled use of `include` / `select`
- Batched relation fetching
- Avoiding per-row DB queries inside loops

### Efficient Querying

- Aggregation queries instead of in-memory processing
- Pagination on all list endpoints
- Indexed columns for frequent queries

---

## Error Handling Strategy

- Centralized error middleware
- Custom `AppError` class
- Async wrapper (`catchAsync`)
- Clear distinction between:
  - Operational errors
  - Programming errors

---

## Docker Setup

The application is fully dockerized for consistent development.

### Run locally

```bash
docker-compose up --build
```

---

## Container Image Security

GitHub Actions builds the production Docker image for `linux/amd64` after the application test job passes. Docker Scout then enforces this merge gate:

- fail on **fixable Critical or High** vulnerabilities;
- ignore vulnerabilities inherited from the Node base image;
- scan the image built in that CI run, rather than an image fetched by tag from a registry.

This is deliberately not a “zero vulnerabilities” policy. Base-image and unfixed findings are still security-relevant, but are reviewed separately because this project cannot safely remediate them by patching a running container. Remediation means updating the Dockerfile, base image, or dependency manifest, rebuilding an image, and rescanning it.

The workflow uses a Docker Hub username and a read-only personal access token stored as GitHub Actions secrets (`DOCKERHUB_USERNAME` and `DOCKERHUB_SCOUT_TOKEN`). No image is pushed by this CI job.

### What the CI gate proves

The gate protects against newly shipped, fixable Critical/High vulnerabilities in application-added runtime packages. It does not prove that the full image has no vulnerabilities, does not replace base-image review, and does not assess whether a CVE is exploitable in a particular deployment.

### Release and deployment model

The CI image tag is local to the runner and identifies the commit that was built; it is not a published deployment artifact. A future release workflow would:

1. build and validate the image;
2. push it to a registry with a commit or release tag;
3. record the registry-provided immutable image digest;
4. deploy by digest (`repository@sha256:...`), not by a mutable tag;
5. monitor the published image for CVEs disclosed after the build.

The Dockerfile currently uses the mutable `node:22-slim` base-image tag. Before a production deployment, that reference should be pinned to an approved digest and updated deliberately through the same build, scan, and validation workflow.

---

## Testing

This project uses Vitest for automated tests.

### Unit Tests

Unit tests cover isolated application logic such as validators and utility functions.

They do not require Docker or PostgreSQL.

```bash
npm run test:unit
```

### Integration Tests

Integration tests exercise the Express API through Supertest and use a separate PostgreSQL test database.

```bash
npm run test:integration
```

Integration tests require:

- Docker/PostgreSQL running
- `TEST_DATABASE_URL` defined in `.env`
- the test database created
- migrations applied to the test database

Example `.env` values:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/wildroutes_dev"
TEST_DATABASE_URL="postgresql://<user>:<password>@localhost:5432/wildroutes_test"
```

Create the test database once:

```bash
docker compose exec postgres createdb -U postgres wildroutes_test
```

Apply migrations to the test database:

```bash
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/wildroutes_test" npx prisma migrate deploy
```

Use the same local credentials configured in `docker-compose.yml`.

The integration test setup maps `TEST_DATABASE_URL` to `DATABASE_URL` before the app is imported, so integration tests run against `wildroutes_test` instead of the development database.
