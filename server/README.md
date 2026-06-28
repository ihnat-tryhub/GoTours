# GoTours Express Backend

Legacy Express/MongoDB backend for the GoTours tour booking platform.

The backend exposes the JSON API consumed by the new React client in `../client`
and still contains the original Pug server-rendered pages.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Stripe Checkout
- Nodemailer
- Multer + Sharp
- Pug

## Features

- Tour CRUD and public tour listing
- User signup, login, logout, and protected routes
- Role-based access checks
- Profile update and avatar upload
- Reviews
- Stripe checkout session creation
- Stripe webhook booking creation
- User booking history endpoint: `GET /api/v1/bookings/me`
- Centralized API error handling

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
copy config.env.example config.env
```

Fill in your MongoDB, JWT, email, and Stripe values.

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

## Important Endpoints

```text
GET    /api/v1/tours
GET    /api/v1/tours/:id
POST   /api/v1/users/signup
POST   /api/v1/users/login
GET    /api/v1/users/me
PATCH  /api/v1/users/updateMe
GET    /api/v1/bookings/me
GET    /api/v1/bookings/checkout-session/:tourId
```

## Environment Variables

Use `config.env.example` as the template. Never commit real secrets.

## Notes

This backend still has legacy tutorial-era architecture and dependencies. The
current work focuses on making it usable as a stable API for the modern React
client while keeping changes small and understandable.
