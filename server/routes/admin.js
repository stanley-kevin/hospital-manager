const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const pool = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', protectAdmin, async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            totalDoctors,
            totalUsers,
            totalAppointments,
            pendingAppointments,
            confirmedAppointments,
            cancelledAppointments,
            todayAppointments,
        ] = await Promise.all([
            Doctor.count(), // count all doctors
            User.countByRole('user'),
            Appointment.count(),
            Appointment.count({ status: 'pending' }),
            Appointment.count({ status: 'confirmed' }),
            Appointment.count({ status: 'cancelled' }),
            Appointment.count({ date: today, notStatus: 'cancelled' }),
        ]);

        res.json({
            success: true,
            stats: {
                totalDoctors,
                totalUsers,
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                cancelledAppointments,
                todayAppointments,
            },
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/admin/activity
// @desc    Get recent activity feed
// @access  Admin
router.get('/activity', protectAdmin, async (req, res, next) => {
    try {
        const [recentAppointments, recentDoctors] = await Promise.all([
            Appointment.findRecent(5),
            Doctor.findRecent(3),
        ]);

        const activity = [
            ...recentAppointments.map((a) => ({
                type: 'appointment',
                icon: '📅',
                text: `${a.patient_name} booked with ${a.doctor_name}`,
                status: a.status,
                time: a.created_at,
            })),
            ...recentDoctors.map((d) => ({
                type: 'doctor',
                icon: '👨‍⚕️',
                text: `Dr. ${d.name} (${d.specialty}) added`,
                time: d.created_at,
            })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

        res.json({ success: true, activity });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/admin/users
// @desc    Get all registered users (legacy endpoint, kept for backward compatibility)
// @access  Admin
router.get('/users', protectAdmin, async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (legacy endpoint, kept for backward compatibility)
// @access  Admin
router.delete('/users/:id', protectAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
        await User.deleteById(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
});

/* ── Doctor Management REST APIs ─────────────────────────────────────────────── */

// @route   GET /api/admin/doctors
// @desc    Get all doctors for admin management
// @access  Admin
router.get('/doctors', protectAdmin, async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM doctors ORDER BY name ASC');
        res.json({ success: true, count: rows.length, doctors: rows });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/admin/doctors
// @desc    Add a new doctor record
// @access  Admin
router.post('/doctors', protectAdmin, async (req, res, next) => {
    try {
        const { name, specialty, designation, location, email, phone, availability_status, photo_url } = req.body;
        if (!name || !specialty || !location) {
            return res.status(400).json({ success: false, message: 'Name, department (specialty), and location are required' });
        }
        const is_available = availability_status === 'Available';
        const initials = name ? name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : 'DR';

        const { rows } = await pool.query(
            `INSERT INTO doctors 
               (name, specialty, designation, location, email, phone, availability_status, is_available, photo_url, initials)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                name,
                specialty,
                designation || null,
                location,
                email || null,
                phone || null,
                availability_status || 'Available',
                is_available,
                photo_url || null,
                initials
            ]
        );
        res.status(201).json({ success: true, message: 'Doctor added successfully', doctor: rows[0] });
    } catch (err) {
        next(err);
    }
});

// @route   PUT /api/admin/doctors/:id
// @desc    Update doctor details
// @access  Admin
router.put('/doctors/:id', protectAdmin, async (req, res, next) => {
    try {
        const { name, specialty, designation, location, email, phone, availability_status, photo_url } = req.body;
        const is_available = availability_status !== undefined ? (availability_status === 'Available') : undefined;

        const allowed = ['name', 'specialty', 'designation', 'location', 'email', 'phone', 'availability_status', 'photo_url', 'is_available'];
        const setClauses = [];
        const params = [];
        let i = 1;

        for (const key of allowed) {
            let val = req.body[key];
            if (key === 'is_available') val = is_available;
            if (val !== undefined) {
                setClauses.push(`${key} = $${i++}`);
                params.push(val);
            }
        }

        if (setClauses.length > 0) {
            setClauses.push(`updated_at = NOW()`);
            params.push(req.params.id);
            const sql = `UPDATE doctors SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`;
            const { rows } = await pool.query(sql, params);
            res.json({ success: true, message: 'Doctor updated successfully', doctor: rows[0] });
        } else {
            const { rows } = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
            res.json({ success: true, doctor: rows[0] });
        }
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/doctors/:id
// @desc    Hard-delete doctor record and cascade appointments
// @access  Admin
router.delete('/doctors/:id', protectAdmin, async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (err) {
        next(err);
    }
});

/* ── Patient Management REST APIs ────────────────────────────────────────────── */

// @route   GET /api/admin/patients
// @desc    Get all registered patients
// @access  Admin
router.get('/patients', protectAdmin, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
        );
        res.json({ success: true, count: rows.length, patients: rows });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/admin/patients/:id
// @desc    Get patient detailed profile and appointment histories
// @access  Admin
router.get('/patients/:id', protectAdmin, async (req, res, next) => {
    try {
        const userRes = await pool.query(
            "SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1 AND role = 'user'",
            [req.params.id]
        );
        const patient = userRes.rows[0];
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const apptsRes = await pool.query(
            "SELECT * FROM appointments WHERE patient_id = $1 ORDER BY date DESC, time DESC",
            [req.params.id]
        );

        res.json({ success: true, patient, appointments: apptsRes.rows });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/patients/:id
// @desc    Delete patient account and cascade appointments
// @access  Admin
router.delete('/patients/:id', protectAdmin, async (req, res, next) => {
    try {
        const userRes = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'user'",
            [req.params.id]
        );
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
