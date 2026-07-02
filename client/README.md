# GoTours React Client

React frontend for the GoTours Express/MongoDB backend in `../server`.

## Stack

- React
- TypeScript
- Vite
- React Router
- Mapbox GL

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
copy .env.example .env
```

Start the old backend from the `server` folder:

```bash
cd ../server
npm install
npm start
```

Start the React client:

```bash
cd ../client
npm run dev
```

Open:

- React client: <http://localhost:5173>
- Backend API: <http://localhost:3000/api/v1/tours>

## Backend Integration

In development, Vite proxies `/api` and `/img` to `http://localhost:3000`.
For production builds, `client/.env.production` points the frontend to:

```bash
VITE_API_ORIGIN=https://gotours.onrender.com
```

Use only the backend origin here. Do not include `/api/v1`, `/api/v1/tours`,
or any other endpoint path. The React client appends API paths itself, for
example `/api/v1/tours`.

If the backend domain changes later, update that value in the deployment
environment or in `client/.env.production`.

Mapbox route maps need these values in `client/.env`:

```bash
VITE_MAPBOX_TOKEN=pk_replace_with_your_public_mapbox_token
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/outdoors-v12
```

## Current Scope

- Home page with featured tours
- Tour listing with filtering and sorting
- Tour details page with gallery, reviews, and Mapbox route map
- Login and signup against the Express API
- Protected profile page
- Name/email profile update
- Avatar upload through `/api/v1/users/updateMe`
- Booking history through `/api/v1/bookings/me`
- Stripe checkout entry point from tour details
- Friendly loading, empty, and error states

## Commands

```bash
npm run dev
npm run build
npm run preview
```
