const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * protect middleware — verifies Firebase ID token sent as Bearer token.
 * Looks up (or auto-creates) the user in PostgreSQL and attaches req.user.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Not authorized, no token' });
        }

        // Verify the Firebase ID token
        const decoded = await admin.auth().verifyIdToken(token);

        // Find or auto-create the user in PostgreSQL (keyed by Firebase UID)
        let user = await User.findByFirebaseUid(decoded.uid);

        if (!user) {
            // First login via Firebase — upsert the user record
            user = await User.upsertByFirebaseUid({
                firebaseUid: decoded.uid,
                email: decoded.email,
                name: decoded.name || decoded.email?.split('@')[0] || 'User',
            });
        }

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res
            .status(401)
            .json({ success: false, message: 'Not authorized, token invalid' });
    }
};

/**
 * adminOnly middleware — must be used after protect.
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res
        .status(403)
        .json({ success: false, message: 'Access denied. Admins only.' });
};

module.exports = { protect, adminOnly };
