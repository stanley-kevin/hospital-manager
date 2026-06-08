const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like server-to-server or curl)
        if (!origin) return callback(null, true);

        // Normalize CLIENT_URL from env vars by removing any trailing slash
        const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';

        if (origin === clientUrl) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Database Connection ──────────────────────────────────────────────────────
const connectDB = require('./config/db');
connectDB();

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', message: '🏥 Hospital Appointment Server is running (PostgreSQL)' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));

// ── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`   Database:     PostgreSQL`);
    console.log(`   Health:       http://localhost:${PORT}/api/health`);
    console.log(`   Auth:         http://localhost:${PORT}/api/auth`);
    console.log(`   Doctors:      http://localhost:${PORT}/api/doctors`);
    console.log(`   Appointments: http://localhost:${PORT}/api/appointments`);
    console.log(`   Admin:        http://localhost:${PORT}/api/admin`);
});

module.exports = app;
