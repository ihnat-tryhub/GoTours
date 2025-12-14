
<h1 align="center">
  GoTours
</h1>

<p align="center">
  <strong>Tour Booking Platform & REST API</strong><br/>
  Backend-focused project built with Node.js, Express, and MongoDB
</p>

<p align="center">
  <a href="https://gotours.onrender.com">Live Demo</a>
  ·
  <a href="https://documenter.getpostman.com/view/39911722/2sAYQiATE5">API Documentation</a>
</p>

---
## 💡 Project Origin & My Contributions

This project is based on the advanced backend architecture from Jonas Schmedtmann's Node.js curriculum ("Natours"). While the core concept serves as an educational foundation, I have gone beyond the tutorial code to treat this as a **production-ready product**.

**My focus was on taking the code from "local environment" to "real world usage":**

* **Production Deployment:** Unlike the course setup, I successfully deployed and configured the app on **Render**, handling environment variables and production database connections.
* **Professional Documentation:** I created comprehensive [Postman API Documentation](https://documenter.getpostman.com/view/39911722/2sAYQiATE5) with example requests/responses, making the API easy to consume for frontend developers.
* **Code Ownership:** I have deeply analyzed and refactored parts of the logic to ensure a full understanding of the MVC pattern, JWT security flow, and Stripe payment integration.
  
## 📌 About the Project

**GoTours** is a full-stack tour booking platform with a strong focus on a production-ready backend and a well-documented REST API.

The application allows users to explore tours, book them securely, write reviews, and manage accounts.  
It also provides **admin-protected endpoints** for managing tours, users, and reviews.

The project was built to demonstrate:
- RESTful API design
- Secure authentication and authorization
- Role-based access control
- Real-world backend architecture

---

## ✨ Key Features

### 👤 Users
- Signup / login with JWT authentication
- Update profile and password
- Book tours via Stripe
- Write and manage reviews

### 🛠 Admin / Guide
- Create, update, and delete tours
- Manage users
- View platform statistics
- Access protected API routes

### 🔒 Security
- JWT authentication (Bearer tokens)
- Role-based access control
- Password hashing
- Data validation and sanitization
- Rate limiting and secure headers

---

## 🧱 Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT Authentication**
- **Stripe Payments**
- **Nodemailer**
- **Server-Side Rendering (Pug)**

### Frontend
- HTML5
- CSS3
- Pug Templates (SSR)

### Tools & Services
- Git & GitHub
- Postman (API testing & documentation)
- Render (deployment)
- Visual Studio Code

---

## 📡 REST API

GoTours exposes a fully-featured REST API.

### API Documentation
👉 **Postman Documenter**  
https://documenter.getpostman.com/view/39911722/2sAYQiATE5

### API Capabilities
- Tours (CRUD, stats, geolocation queries)
- Users & authentication
- Reviews (including nested routes)
- Protected & admin-only endpoints

Base URL:
```

[https://gotours.onrender.com/api/v1](https://gotours.onrender.com/api/v1)

```

---

## 🚀 Deployment

The project is deployed on **Render**:

🔗 https://gotours.onrender.com

---

## 📂 Project Structure

```

GoTours/
│
├── controllers/      # Business logic
├── models/           # Mongoose schemas
├── routes/           # API routes
├── utils/            # Helpers (auth, email, error handling)
├── views/            # Pug templates (SSR)
├── public/           # Static assets
└── server.js         # App entry point

```

---

## 📬 Contact

**GitHub:** https://github.com/Sleepwalkerqwe  
**Telegram:** https://t.me/sleepwalkerua  

---

<p align="right"><a href="#top">⬆ back to top</a></p>

