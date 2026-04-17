/**
 * User model — PostgreSQL query helpers (replaces Mongoose model)
 */
const pool = require('../config/db');

const User = {
    /**
     * Find user by Firebase UID
     */
    async findByFirebaseUid(firebaseUid) {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1',
            [firebaseUid]
        );
        return rows[0] || null;
    },

    /**
     * Find user by email
     */
    async findByEmail(email) {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [email]
        );
        return rows[0] || null;
    },

    /**
     * Find user by numeric id
     */
    async findById(id) {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE id = $1 LIMIT 1',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Upsert a user by Firebase UID or email.
     * Used by firebase-sync route and protect middleware.
     */
    async upsertByFirebaseUid({ firebaseUid, email, name }) {
        const { rows } = await pool.query(
            `INSERT INTO users (firebase_uid, email, name, role, password)
             VALUES ($1, $2, $3, 'user', 'firebase-managed')
             ON CONFLICT (firebase_uid) DO UPDATE
               SET email      = EXCLUDED.email,
                   name       = EXCLUDED.name,
                   updated_at = NOW()
             RETURNING *`,
            [firebaseUid, email, name]
        );
        // If firebase_uid was null and email already exists, link the uid
        if (!rows[0]) {
            const { rows: r2 } = await pool.query(
                `UPDATE users SET firebase_uid = $1, updated_at = NOW()
                 WHERE email = $2
                 RETURNING *`,
                [firebaseUid, email]
            );
            return r2[0] || null;
        }
        return rows[0];
    },

    /**
     * Find all users, optionally filtered by role.
     */
    async findAll({ role } = {}) {
        let sql = 'SELECT id, firebase_uid, name, email, role, phone, created_at, updated_at FROM users';
        const params = [];
        if (role) {
            sql += ' WHERE role = $1';
            params.push(role);
        }
        sql += ' ORDER BY created_at DESC';
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    /**
     * Delete user by id.
     */
    async deleteById(id) {
        const { rows } = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Count users by role.
     */
    async countByRole(role) {
        const { rows } = await pool.query(
            'SELECT COUNT(*)::int AS count FROM users WHERE role = $1',
            [role]
        );
        return rows[0].count;
    },
};

module.exports = User;
