/**
 * Doctor model — PostgreSQL query helpers (replaces Mongoose model)
 */
const pool = require('../config/db');

const Doctor = {
    /**
     * Get all doctors with optional filters.
     * Supports specialty, location (partial), name (partial).
     */
    async findAll({ specialty, location, name } = {}) {
        const conditions = ['is_available = TRUE'];
        const params = [];
        let i = 1;

        if (specialty) {
            conditions.push(`specialty = $${i++}`);
            params.push(specialty);
        }
        if (location) {
            conditions.push(`location ILIKE $${i++}`);
            params.push(`%${location}%`);
        }
        if (name) {
            conditions.push(`name ILIKE $${i++}`);
            params.push(`%${name}%`);
        }

        const sql = `SELECT * FROM doctors WHERE ${conditions.join(' AND ')} ORDER BY name ASC`;
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    /**
     * Find a single doctor by primary key.
     */
    async findById(id) {
        const { rows } = await pool.query(
            'SELECT * FROM doctors WHERE id = $1 LIMIT 1',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Create a new doctor record.
     */
    async create({ name, specialty, designation, location, experience, availability, rating, is_available, bio, photo_url, initials }) {
        const { rows } = await pool.query(
            `INSERT INTO doctors
               (name, specialty, designation, location, experience, availability, rating, is_available, bio, photo_url, initials)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                name,
                specialty,
                designation || null,
                location,
                experience || '5+ years',
                availability || 'Mon–Fri',
                rating ?? 4.5,
                is_available !== undefined ? is_available : true,
                bio || null,
                photo_url || null,
                initials || null,
            ]
        );
        return rows[0];
    },

    /**
     * Update a doctor record by id. Only updates provided fields.
     */
    async update(id, fields) {
        const allowed = ['name','specialty','designation','location','experience','availability','rating','is_available','bio','photo_url','initials'];
        const setClauses = [];
        const params = [];
        let i = 1;

        for (const key of allowed) {
            // Map camelCase from req.body to snake_case column
            const bodyKey = key === 'is_available' ? 'isAvailable'
                          : key === 'photo_url'    ? 'photoUrl'
                          : key;
            if (fields[bodyKey] !== undefined) {
                setClauses.push(`${key} = $${i++}`);
                params.push(fields[bodyKey]);
            } else if (fields[key] !== undefined) {
                setClauses.push(`${key} = $${i++}`);
                params.push(fields[key]);
            }
        }

        if (setClauses.length === 0) return this.findById(id);

        setClauses.push(`updated_at = NOW()`);
        params.push(id);

        const { rows } = await pool.query(
            `UPDATE doctors SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
            params
        );
        return rows[0] || null;
    },

    /**
     * Soft-delete: mark doctor as unavailable.
     */
    async softDelete(id) {
        const { rows } = await pool.query(
            'UPDATE doctors SET is_available = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Count available doctors.
     */
    async count({ is_available } = {}) {
        let sql = 'SELECT COUNT(*)::int AS count FROM doctors';
        const params = [];
        if (is_available !== undefined) {
            sql += ' WHERE is_available = $1';
            params.push(is_available);
        }
        const { rows } = await pool.query(sql, params);
        return rows[0].count;
    },

    /**
     * Get recent doctors (for admin activity feed).
     */
    async findRecent(limit = 3) {
        const { rows } = await pool.query(
            'SELECT id, name, specialty, created_at FROM doctors ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        return rows;
    },
};

module.exports = Doctor;
