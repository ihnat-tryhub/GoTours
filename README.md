<div align="center">

# 🌍 GoTours

### Full-stack tour booking application — React × TypeScript × Express × MongoDB

<br/>

[![Frontend](https://img.shields.io/badge/React%20%2B%20TypeScript-149eca?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Express%20%2B%20MongoDB-2f855a?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-635bff?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://www.mapbox.com/)

<br/>

[![Frontend Deploy](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://go-tours-liard.vercel.app)
[![Backend Deploy](https://img.shields.io/badge/Backend-Render-46e3b7?style=flat-square&logo=render)](https://gotours.onrender.com)
[![API Docs](https://img.shields.io/badge/API_Docs-Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)](https://documenter.getpostman.com/view/39911722/2sAYQiATE5)

<br/>

**[🚀 Live Demo](https://go-tours-liard.vercel.app)** &nbsp;·&nbsp; **[📖 API Docs](https://documenter.getpostman.com/view/39911722/2sAYQiATE5)** &nbsp;·&nbsp; **[🔌 Backend](https://gotours.onrender.com)**

</div>

---

## 📌 About the Project

GoTours is a **portfolio full-stack project** that started as a Natours-inspired Express application and was reshaped into a clean, modern product. The legacy server lives in `server/` and a new React client was built from scratch in `client/`.

The goal was to practice **real full-stack work**: building on top of an existing codebase, designing a clear API boundary, integrating third-party services, and shipping to production — not just following a tutorial.

---

## ✨ Features

### 🧭 User Experience
- Public home page and tour catalog with rich tour cards
- Tour detail pages with **gallery**, route info, **reviews**, and **Mapbox interactive maps**
- Signup, login, logout, and protected routes
- Profile page — update name, email, and avatar
- **Avatar upload** with live preview
- **Booking history** page powered by the backend API
- **Stripe Checkout** integration for tour purchases
- Friendly error messages, loading skeletons, and smooth page transitions
- Fully responsive layout

### ⚙️ Backend API
- Tour listing and tour detail endpoints with **geospatial queries**
- JWT-based **authentication** and user management
- Profile update and avatar upload (`Multer` + `Sharp`)
- **Review system** with rating aggregation and duplicate prevention
- **Stripe Checkout** session creation and webhook booking creation
- **Transactional email** handling (Nodemailer / SendGrid-ready)
- Password reset flow via email
- CORS support for deployed frontend and local Vite dev server
- Reusable controller factory pattern for clean DRY code

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite, React Router |
| **Styling** | Plain CSS — responsive layouts, skeletons, transitions |
| **Maps** | Mapbox GL JS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Payments** | Stripe Checkout + Webhooks |
| **File Uploads** | Multer + Sharp |
| **Email** | Nodemailer / SendGrid-ready |
| **Legacy Views** | Pug SSR (original app, kept as backend) |
| **Deploy** | Vercel (frontend), Render (backend) |

---

## 🏗 Project Structure

```
GoTours/
├── client/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── pages/   # Route-level page components
│   │   ├── components/
│   │   └── ...
│   └── .env.example
│
└── server/          # Express + MongoDB API + legacy Pug pages
    ├── controllers/
    ├── models/
    ├── routes/
    ├── utils/
    └── config.env.example
```

---

## 🔌 API Overview

Full API collection → **[Postman Docs](https://documenter.getpostman.com/view/39911722/2sAYQiATE5)**

Key endpoints used by the React client:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tours` | List all tours |
| `GET` | `/api/v1/tours/:id` | Get single tour |
| `POST` | `/api/v1/users/signup` | Create account |
| `POST` | `/api/v1/users/login` | Log in |
| `GET` | `/api/v1/users/me` | Get current user |
| `PATCH` | `/api/v1/users/updateMe` | Update profile / avatar |
| `GET` | `/api/v1/bookings/me` | User's booking history |
| `GET` | `/api/v1/bookings/checkout-session/:tourId` | Create Stripe session |

> The backend also serves legacy SSR pages (`/`, `/tour/:slug`, `/my-tours`). The React client uses the JSON API instead.

---

## 🚀 Local Development

### Prerequisites

- Node.js 20+
- npm
- MongoDB connection string
- Mapbox public token
- Stripe keys *(optional — only for checkout testing)*

---

### 1. Start the Backend

```bash
cd server
npm install
copy config.env.example config.env   # then fill in your values
npm start
```

Server runs on → `http://localhost:3000`

---

### 2. Start the Frontend

```bash
cd client
npm install
copy .env.example .env   # VITE_API_ORIGIN can stay empty locally
npm run dev
```

Frontend runs on → `http://localhost:5173`

> In local development, `VITE_API_ORIGIN` can stay **empty** — Vite proxies `/api` and `/img` to `http://localhost:3000` automatically.

---

## 🔑 Environment Variables

### Backend — `server/config.env`

```env
NODE_ENV=development
PORT=3000
CLIENT_ORIGIN=http://localhost:5173

DATABASE=<your MongoDB URI>
DATABASE_PASSWORD=<your DB password>

JWT_SECRET=<long random string>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_FROM=<sender email>
EMAIL_USERNAME=<mailtrap or SMTP username>
EMAIL_PASSWORD=<mailtrap or SMTP password>
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=25

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=<SendGrid API key>

STRIPE_SECRET_KEY=<sk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>
```

### Frontend — `client/.env`

```env
# Leave empty for local dev (Vite proxy handles it)
VITE_API_ORIGIN=

# For production builds:
# VITE_API_ORIGIN=https://gotours.onrender.com

VITE_MAPBOX_TOKEN=pk_replace_with_your_public_mapbox_token
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/outdoors-v12
```

> ⚠️ Real `.env` and `config.env` files are intentionally ignored by Git. Never commit secrets.

---

## 📦 Useful Commands

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build locally
```

---

## ☁️ Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [go-tours-liard.vercel.app](https://go-tours-liard.vercel.app) |
| Backend | Render | [gotours.onrender.com](https://gotours.onrender.com) |

**Production frontend env:**
```env
VITE_API_ORIGIN=https://gotours.onrender.com
```

**Production backend env:**
```env
CLIENT_ORIGIN=https://go-tours-liard.vercel.app
```

---

## 🎯 Portfolio Focus

This repository is **intentionally not a blind tutorial rewrite**. The original Express/Mongoose backend is kept as a working API, while the client was rebuilt as a modern React application with a cleaner UX and explicit API boundary.

**The project demonstrates:**

- ✅ Working with and extending an **existing codebase**
- ✅ Separating frontend and backend concerns clearly
- ✅ Consuming a **REST API** from a typed React client
- ✅ Handling **authentication** and protected UI states
- ✅ Integrating **maps**, image uploads, and **checkout flows**
- ✅ Preparing a project for **real production deployment**
- ✅ Documenting limitations honestly instead of hiding them

---

## ⚠️ Current Limitations

- The backend still contains legacy Pug SSR pages from the original project
- Stripe checkout requires valid Stripe configuration and webhook setup
- Automated test coverage is not the current focus of this version
- The backend architecture is still Express/Mongoose; a NestJS rebuild can be developed independently later

---

## 🔒 Security Notes

- Never commit real secrets to version control
- Rotate any secret previously exposed outside the repository
- Keep production values in the hosting provider's environment settings
- Use test Stripe keys for local development

---

<div align="center">

Made with ☕ · [GitHub](https://github.com/ihnat-tryhub/GoTours)

</div>
