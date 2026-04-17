const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
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
            Doctor.count({ is_available: true }),
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
// @desc    Get all registered users
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
// @desc    Delete a user
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

module.exports = router;
