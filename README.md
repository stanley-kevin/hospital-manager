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

---

## 🛠️ Done in the Project

Here is a summary of the key fixes and improvements implemented in the system:

1. **Doctors Page Redesign**:
   - Expanded departments filter list (`General Medicine`, `Gynecology`, `ENT`).
   - Redesigned doctor cards to display profile photos, specialties, locations, availability status, and contact details (email/phone).
   - Ensured responsive design rendering clean cards across mobile, tablet, and desktop screen sizes.

2. **Appointment Booking Dropdown**:
   - Implemented dynamic, real-time doctor select fields in the booking modal.
   - Added auto-population displaying the selected doctor's department and specialization.
   - Added backend validation preventing scheduling appointments for inactive/unavailable doctors.

3. **MongoDB Storage**:
   - Enabled storing patient email directly inside MongoDB appointments.
   - Fixed naming translation issues between backend database models and the frontend, resolving the bug where doctor names did not show up in the "My Appointments" screen.

4. **Admin Panel Synchronization**:
   - Stored and updated added/edited/deleted doctor accounts dynamically in MongoDB.
   - Synced doctor status changes instantly across the Doctor Search, Doctor filters, and Booking options without manual edits.
