# Wild Tours

A production-style backend API built to simulate a real-world tours platform, inspired by the concept of “Nasty Tours”, but redesigned with a relational database (PostgreSQL) and modern backend best practices.

This project was created as part of a personal refresh of modern backend engineering practices, focusing on:
* Clean architecture
* SQL & ORM-based data modeling
* Performance-aware API design
* Security & production readiness


## Tech Stack
* Node.js – Runtime
* Express.js – REST API framework
* PostgreSQL – Relational database
* Prisma ORM – Type-safe database access & migrations
* Docker – Containerized development environment

## Project Goals
* Real-world backend architecture patterns* Asynchronous JavaScript: Implemented the fundamentals of promises and modern async/await syntax for handling asynchronous code.
* Transition from NoSQL mindset → relational modeling
* Proper use of ORM without performance pitfalls
* Implementation of security best practices
* Awareness of N+1 query problems and optimizations

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
