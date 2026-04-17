const express = require('express');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/admin-login
// @desc    Admin login with shared credentials (no Firebase)
// @access  Public
router.post('/admin-login', (req, res) => {
    const { email, password } = req.body;

    if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
        { role: 'admin', email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
        success: true,
        token,
        admin: { email, role: 'admin' },
    });
});

// @route   POST /api/auth/firebase-sync
// @desc    Called after Firebase login — upserts user in PostgreSQL, returns profile
// @access  Public (verified via Firebase token in body)
router.post('/firebase-sync', async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'idToken required' });
        }

        // Verify the Firebase token
        const decoded = await admin.auth().verifyIdToken(idToken);

        // Upsert user in PostgreSQL
        const user = await User.upsertByFirebaseUid({
            firebaseUid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.email?.split('@')[0] || 'User',
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (err) {
        console.error('firebase-sync error:', err.message);
        next(err);
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private (Firebase token)
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
        },
    });
});

module.exports = router;
