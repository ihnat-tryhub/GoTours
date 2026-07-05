# GoTours v2 API

GoTours v2 API is a clean NestJS backend rebuild of an older Natours-inspired learning project. The old Express/Mongoose application is used only as domain inspiration; this version is designed as an independent, production-oriented portfolio backend for a tour booking platform.

## Current Scope

The project currently contains the backend foundation and database domain schema:

- NestJS with TypeScript
- Environment configuration and validation
- PostgreSQL connection through Prisma
- Docker Compose for local PostgreSQL
- Prisma models for users, tours, bookings, payments, payment events, reviews, and refresh tokens
- Demo tour seed data
- Authentication foundation with register, login, refresh, logout, and current user endpoint
- JWT access tokens and hashed refresh tokens
- Role guard and current-user decorator for later modules
- User profile endpoints
- Admin user listing, role updates, and user deactivation
- Public tour listing and tour details
- Admin tour create, update, and deactivation endpoints
- Booking creation for authenticated users
- User booking history and admin booking visibility
- Public tour reviews
- Authenticated review creation, owner updates/deletes, and admin moderation
- Stripe Checkout session creation
- Stripe webhook signature verification and idempotent payment event storage
- Helmet, configurable CORS, and global request rate limiting
- Centralized JSON error responses
- Global API prefix: `/api/v1`
- Global validation pipe
- Health endpoint: `GET /api/v1/health`
- Swagger documentation: `/api/docs`
- ESLint and Prettier setup

Broader admin API modules and automated refund handling are intentionally not implemented yet.

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop or another Docker-compatible runtime

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start PostgreSQL:

```bash
docker compose up -d
```

Generate the Prisma client:

```bash
npx prisma generate
```

Create and apply the local database migration:

```bash
npx prisma migrate dev --name init
```

Seed demo tour data:

```bash
npm run prisma:seed
```

Start the API in development mode:

```bash
npm run start:dev
```

Open:

- Health: <http://localhost:3000/api/v1/health>
- Swagger: <http://localhost:3000/api/docs>

## Environment Variables

| Variable                       | Example                                                                         | Description                                      |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `NODE_ENV`                     | `development`                                                                   | Runtime environment                              |
| `PORT`                         | `3000`                                                                          | API port                                         |
| `DATABASE_URL`                 | `postgresql://gotours:gotours_password@localhost:5432/gotours_v2?schema=public` | PostgreSQL connection string used by Prisma      |
| `JWT_ACCESS_TOKEN_SECRET`      | `replace-with-a-long-random-access-token-secret`                                | Secret used to sign JWT access tokens            |
| `JWT_ACCESS_TOKEN_TTL_SECONDS` | `900`                                                                           | Access token lifetime in seconds                 |
| `REFRESH_TOKEN_TTL_DAYS`       | `30`                                                                            | Refresh token lifetime in days                   |
| `BCRYPT_SALT_ROUNDS`           | `12`                                                                            | bcrypt cost factor for password hashing          |
| `STRIPE_SECRET_KEY`            | `sk_test_replace_me`                                                            | Stripe secret key for Checkout sessions          |
| `STRIPE_WEBHOOK_SECRET`        | `whsec_replace_me`                                                              | Stripe webhook endpoint signing secret           |
| `STRIPE_CHECKOUT_SUCCESS_URL`  | `http://localhost:5173/bookings/success?session_id={CHECKOUT_SESSION_ID}`       | Frontend URL after Checkout success              |
| `STRIPE_CHECKOUT_CANCEL_URL`   | `http://localhost:5173/bookings/cancel`                                         | Frontend URL after Checkout cancellation         |
| `CORS_ORIGINS`                 | `http://localhost:5173`                                                         | Comma-separated frontend origins allowed by CORS |
| `THROTTLE_TTL_SECONDS`         | `60`                                                                            | Rate-limit window length in seconds              |
| `THROTTLE_LIMIT`               | `100`                                                                           | Maximum requests per rate-limit window           |

## Auth Endpoints

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Passwords are hashed with bcrypt and are never returned by the API. Refresh tokens are returned once to the client, while only their SHA-256 hash is stored in the database.

## User Endpoints

```txt
GET   /api/v1/users/me
PATCH /api/v1/users/me
GET   /api/v1/admin/users
PATCH /api/v1/admin/users/:id/role
PATCH /api/v1/admin/users/:id/deactivate
```

Admin user routes require the `ADMIN` role. Deactivating a user is a soft-delete style operation and also revokes active refresh tokens for that user.

## Tour Endpoints

```txt
GET   /api/v1/tours
GET   /api/v1/tours/:slug
POST  /api/v1/admin/tours
PATCH /api/v1/admin/tours/:id
PATCH /api/v1/admin/tours/:id/deactivate
```

Public tour listing supports pagination, search, difficulty filtering, price filtering, and sorting. Public endpoints only return active tours. Admin tour routes require the `ADMIN` role.

## Booking Endpoints

```txt
POST /api/v1/bookings
GET  /api/v1/bookings/me
GET  /api/v1/admin/bookings
GET  /api/v1/admin/bookings/:id
```

Creating a booking stores a `PENDING_PAYMENT` booking for an active tour and selected start date. Payment confirmation happens through the Stripe webhook, so client-side success must not be treated as paid.

## Payment Endpoints

```txt
POST /api/v1/payments/checkout-sessions
POST /api/v1/payments/webhook
GET  /api/v1/payments/:id
```

Checkout session creation requires an authenticated user and a booking owned by that user. The API stores payments as `PENDING` until a verified Stripe webhook arrives. Booking status changes to `PAID` only inside webhook processing for `checkout.session.completed`; the frontend success URL is not trusted as payment confirmation.

The Stripe webhook endpoint is excluded from the global request rate limit because Stripe may retry or deliver multiple server-to-server events close together.

For local webhook testing, use Stripe CLI and forward events to:

```txt
http://localhost:3000/api/v1/payments/webhook
```

## Review Endpoints

```txt
GET    /api/v1/tours/:tourId/reviews
POST   /api/v1/tours/:tourId/reviews
PATCH  /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
GET    /api/v1/admin/reviews
PATCH  /api/v1/admin/reviews/:id/moderate
```

Users can create one review per tour after they have a booking for that tour. Published review changes update the tour rating aggregation.

## Prisma Commands

```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npx prisma studio
```

The schema includes the current core domain tables used by the API modules.

## Database Model Overview

- `User`: application user with `USER`, `GUIDE`, or `ADMIN` role
- `RefreshToken`: hashed refresh tokens for future auth sessions
- `Tour`: public tour catalog item with pricing, dates, images, and rating summary
- `Booking`: user reservation for a tour
- `Payment`: payment state linked to a booking
- `PaymentEvent`: stored Stripe webhook events for idempotent processing
- `Review`: user review linked to a booked tour

## Verification

Check that PostgreSQL is running:

```bash
docker compose ps
```

Check that Prisma can reach the database:

```bash
echo "SELECT 1;" | npx prisma db execute --schema prisma/schema.prisma --stdin
```

Check that the application builds:

```bash
npm run build
```

## Project Origin

This project is inspired by an older GoTours/Natours-style Express and MongoDB application. GoTours v2 is not a direct rewrite. It is a new API-first backend built with NestJS, PostgreSQL, and Prisma to demonstrate practical backend engineering skills for junior and working-student roles.

## Phase 2 TODO

- Add the first e2e tests for auth and protected routes
- Tighten review eligibility to `PAID` bookings only if that matches the desired business rule
- Add GitHub Actions CI for lint, tests, and build
- Add automated refund handling if needed later
