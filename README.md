# GoTours

Modern React client for the original GoTours Express/MongoDB backend.

This repository keeps the legacy backend in `server/` and adds a new Vite React
frontend in `client/`. The goal is to show a realistic full-stack portfolio
project: API integration, authentication, protected pages, tour browsing,
booking history, profile editing, avatar upload, Mapbox route maps, and clean
frontend states.

## Project Structure

```text
.
+-- client/   # React + TypeScript + Vite frontend
`-- server/   # Express + MongoDB backend API and old SSR views
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Mapbox GL
- Plain CSS with responsive layouts and loading states

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Stripe Checkout
- Multer + Sharp for image uploads
- Pug SSR pages from the original project

## Features

- Public tour listing and tour details
- Interactive Mapbox route map on tour details pages
- User signup, login, logout, and protected routes
- Profile page with name/email update
- Avatar upload with image preview
- Checkout entry point through Stripe session creation
- User booking history through `GET /api/v1/bookings/me`
- Friendly client-side API error handling
- Responsive cards, skeletons, smooth UI states, and polished forms

## Local Setup

Install backend dependencies:

```bash
cd server
npm install
copy config.env.example config.env
```

Fill `server/config.env` with your MongoDB, JWT, email, and Stripe values.

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

Install frontend dependencies:

```bash
cd ../client
npm install
copy .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

During development, Vite proxies `/api` and `/img` to
`http://localhost:3000`, so the React client can use the old Express backend
without extra CORS setup.

## Environment Variables

Backend variables are documented in:

```text
server/config.env.example
```

Frontend variables are documented in:

```text
client/.env.example
```

The production frontend API origin is configured in:

```text
client/.env.production
```

Current production backend:

```text
https://gotours.onrender.com
```

Current production frontend:

```text
https://go-tours-liard.vercel.app
```

The backend CORS config allows that frontend origin.

Do not commit real `.env` or `config.env` files.

## Useful Commands

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm run dev
npm run build
```

## Project Origin

The original backend was inspired by the Natours/GoTours style Express and
MongoDB project. The current repository keeps that backend as a legacy API and
adds a new React frontend, improved API error handling, booking history support,
and profile avatar upload.

The focus is not to copy tutorial code, but to turn the project into a clearer,
more maintainable full-stack portfolio project.
