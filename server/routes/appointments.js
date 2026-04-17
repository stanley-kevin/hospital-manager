const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// @route   PUT /api/appointments/:id/status
// @desc    Admin approve or reject an appointment
// @access  Admin JWT only
router.put('/:id/status', protectAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be confirmed or cancelled' });
        }
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        const updated = await Appointment.update(req.params.id, { status });
        res.json({ success: true, message: `Appointment ${status}`, appointment: updated });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/appointments
// @desc    Get appointments for logged-in user
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const appointments = await Appointment.findByPatient({
            userId: req.user.id,
            firebaseUid: req.user.firebase_uid || null,
        });
        res.json({ success: true, count: appointments.length, appointments });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/appointments/all
// @desc    Get all appointments (admin)
// @access  Admin JWT or Firebase admin
router.get('/all', protectAdmin, async (req, res, next) => {
    try {
        const { status, date } = req.query;
        const appointments = await Appointment.findAll({
            status: status || undefined,
            date: date || undefined,
        });
        res.json({ success: true, count: appointments.length, appointments });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private
router.post(
    '/',
    protect,
    [
        body('doctorId').notEmpty().withMessage('Doctor is required'),
        body('date').notEmpty().withMessage('Date is required'),
        body('time').notEmpty().withMessage('Time is required'),
        body('patientName').trim().notEmpty().withMessage('Patient name is required'),
        body('patientPhone').trim().notEmpty().withMessage('Patient phone is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { doctorId, date, time, patientName, patientPhone, reason } = req.body;

            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            // Check for duplicate appointment (same doctor, date, time)
            const existing = await Appointment.findDuplicate({ doctorId, date, time });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'That time slot is already booked. Please choose a different time.',
                });
            }

            const appointment = await Appointment.create({
                patient_id: req.user.id,
                patient_firebase_uid: req.user.firebase_uid || null,
                patient_name: patientName,
                patient_phone: patientPhone,
                doctor_id: doctorId,
                doctor_name: doctor.name,
                specialty: doctor.specialty,
                date,
                time,
                reason,
            });

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                appointment,
            });
        } catch (err) {
            next(err);
        }
    }
);

// @route   PUT /api/appointments/:id
// @desc    Reschedule or update appointment status
// @access  Private (own) / Admin (any)
router.put('/:id', protect, async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Allow owner or admin
        const isOwner = String(appointment.patient_id) === String(req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Prevent editing completed/cancelled
        if (!isAdmin && ['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot modify a ${appointment.status} appointment`,
            });
        }

        const allowedUpdates = isAdmin
            ? ['date', 'time', 'status', 'notes', 'patientName', 'patientPhone', 'reason']
            : ['date', 'time', 'patientName', 'patientPhone', 'reason'];

        const updatePayload = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) updatePayload[field] = req.body[field];
        });

        const updated = await Appointment.update(req.params.id, updatePayload);
        res.json({ success: true, message: 'Appointment updated successfully', appointment: updated });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private (own) / Admin (any)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const isOwner = String(appointment.patient_id) === String(req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Appointment.update(req.params.id, { status: 'cancelled' });
        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
