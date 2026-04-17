const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all available doctors (with optional filters)
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const { specialty, department, location, name } = req.query;
        const specialtyFilter = specialty || department;
        const doctors = await Doctor.findAll({
            specialty: specialtyFilter || undefined,
            location: location || undefined,
            name: name || undefined,
        });
        res.json({ success: true, count: doctors.length, doctors });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, doctor });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/doctors
// @desc    Add a new doctor
// @access  Admin
router.post(
    '/',
    protect,
    adminOnly,
    [
        body('name').trim().notEmpty().withMessage('Doctor name is required'),
        body('specialty').trim().notEmpty().withMessage('Specialty is required'),
        body('location').trim().notEmpty().withMessage('Location is required'),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }
            const doctor = await Doctor.create(req.body);
            res.status(201).json({ success: true, message: 'Doctor added successfully', doctor });
        } catch (err) {
            next(err);
        }
    }
);

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
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

// @route   DELETE /api/doctors/:id
// @desc    Soft-delete doctor (mark unavailable)
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const doctor = await Doctor.softDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, message: 'Doctor removed successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
