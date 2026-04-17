const jwt = require('jsonwebtoken');

/**
 * protectAdmin — verifies the admin-specific JWT (NOT Firebase).
 * The token is issued by POST /api/auth/admin-login.
 * Sets req.adminUser = { role: 'admin' } on success.
 */
const protectAdmin = (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'No admin token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not an admin token' });
        }

        req.adminUser = decoded; // { role: 'admin', email: '...' }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Admin token invalid or expired' });
    }
};

module.exports = { protectAdmin };
