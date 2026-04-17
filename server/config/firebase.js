const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Firebase Admin SDK — initialized with Service Account credentials.
 * The serviceAccountKey.json file must be in the /server directory.
 */
if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (fs.existsSync(keyPath)) {
        // Full credential auth (required for verifyIdToken)
        const serviceAccount = require(keyPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('🔑 Firebase Admin: initialized with service account credentials');
    } else {
        // Fallback — token verification will NOT work without credentials
        console.warn('⚠️  Firebase Admin: serviceAccountKey.json not found — token verification disabled!');
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'hospital-123-93984',
        });
    }
}

module.exports = admin;
