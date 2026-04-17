# 🏥 Hospital Appointment Booking System

A full-stack Hospital Appointment Booking System with a clean frontend and a Node.js/Express backend stub.

---

## 📁 Project Structure

```
hospitalappoint/
├── client/                  # Frontend (HTML, CSS, JavaScript)
│   ├── index.html           # Home page
│   ├── doctors.html         # Doctors listing & search
│   ├── appointments.html    # My Appointments page
│   ├── admin.html           # Admin Dashboard
│   ├── login.html           # Login page
│   ├── styles.css           # Main stylesheet
│   ├── login.css            # Login page stylesheet
│   ├── script.js            # Main frontend JavaScript
│   ├── auth.js              # Auth guard (localStorage-based)
│   ├── login.js             # Login form logic
│   └── assets/
│       └── MERN logo.jpg    # App image asset
│
├── server/                  # Backend (Node.js / Express)
│   ├── index.js             # Express server entry point
│   ├── package.json         # Node dependencies
│   └── .env.example         # Environment variable template
│
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

---

## 🚀 Getting Started

### Frontend

Open `client/login.html` directly in your browser, or serve with VS Code Live Server.

- Login with any email + password (tick the "I am not a robot" checkbox).
- Navigate to Doctors, Appointments, and Admin pages from the home screen.

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The server starts on [http://localhost:5000](http://localhost:5000).

Health check: `GET /api/health`

---

## 🛠 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Node.js, Express        |
| Deploy   | Vercel                  |
