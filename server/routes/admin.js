const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
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
        const docs = await Doctor.rawModel.find().sort({ name: 1 });
        const cleanDocs = docs.map(d => {
            const obj = d.toObject();
            obj.id = obj._id.toString();
            return obj;
        });
        res.json({ success: true, count: cleanDocs.length, doctors: cleanDocs });
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
        const initials = name ? name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : 'DR';

        const doctor = await Doctor.create({
            name,
            specialty,
            designation,
            location,
            email,
            phone,
            availability_status,
            photo_url,
            initials
        });
        res.status(201).json({ success: true, message: 'Doctor added successfully', doctor });
    } catch (err) {
        next(err);
    }
});

// @route   PUT /api/admin/doctors/:id
// @desc    Update doctor details
// @access  Admin
router.put('/doctors/:id', protectAdmin, async (req, res, next) => {
    try {
        const doctor = await Doctor.update(req.params.id, req.body);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, message: 'Doctor updated successfully', doctor });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/doctors/:id
// @desc    Hard-delete doctor record and cascade appointments
// @access  Admin
router.delete('/doctors/:id', protectAdmin, async (req, res, next) => {
    try {
        const doctor = await Doctor.rawModel.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        await Doctor.rawModel.findByIdAndDelete(req.params.id);
        // Cascade delete appointments
        await Appointment.rawModel.deleteMany({ doctor_id: req.params.id });
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
        const patients = await User.findAll({ role: 'user' });
        res.json({ success: true, count: patients.length, patients });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/admin/patients/:id
// @desc    Get patient detailed profile and appointment histories
// @access  Admin
router.get('/patients/:id', protectAdmin, async (req, res, next) => {
    try {
        const patient = await User.findById(req.params.id);
        if (!patient || patient.role !== 'user') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const appts = await Appointment.rawModel.find({ patient_id: req.params.id }).sort({ date: -1, time: -1 });
        const cleanAppts = appts.map(a => {
            const obj = a.toObject();
            obj.id = obj._id.toString();
            return obj;
        });

        res.json({ success: true, patient, appointments: cleanAppts });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/patients/:id
// @desc    Delete patient account and cascade appointments
// @access  Admin
router.delete('/patients/:id', protectAdmin, async (req, res, next) => {
    try {
        const patient = await User.rawModel.findById(req.params.id);
        if (!patient || patient.role !== 'user') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        await User.rawModel.findByIdAndDelete(req.params.id);
        // Cascade delete appointments
        await Appointment.rawModel.deleteMany({ patient_id: req.params.id });
        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
