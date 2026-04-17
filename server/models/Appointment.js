/**
 * Appointment model — PostgreSQL query helpers (replaces Mongoose model)
 */
const pool = require('../config/db');

const Appointment = {
    /**
     * Get appointments for a specific patient (by user id or firebase uid).
     */
    async findByPatient({ userId, firebaseUid }) {
        let sql, params;
        if (firebaseUid) {
            sql = `SELECT * FROM appointments
                   WHERE patient_id = $1 OR patient_firebase_uid = $2
                   ORDER BY created_at DESC`;
            params = [userId, firebaseUid];
        } else {
            sql = `SELECT * FROM appointments WHERE patient_id = $1 ORDER BY created_at DESC`;
            params = [userId];
        }
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    /**
     * Get all appointments (admin). Supports optional status/date filters.
     * Joins with users to populate patient info.
     */
    async findAll({ status, date } = {}) {
        const conditions = [];
        const params = [];
        let i = 1;

        if (status) { conditions.push(`a.status = $${i++}`); params.push(status); }
        if (date)   { conditions.push(`a.date = $${i++}`);   params.push(date); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT a.*,
                   u.name  AS patient_user_name,
                   u.email AS patient_user_email,
                   u.phone AS patient_user_phone
            FROM appointments a
            LEFT JOIN users u ON u.id = a.patient_id
            ${where}
            ORDER BY a.created_at DESC
        `;
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    /**
     * Find a single appointment by id.
     */
    async findById(id) {
        const { rows } = await pool.query(
            'SELECT * FROM appointments WHERE id = $1 LIMIT 1',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Check for a duplicate appointment (same doctor, date, time, non-cancelled/completed).
     */
    async findDuplicate({ doctorId, date, time }) {
        const { rows } = await pool.query(
            `SELECT id FROM appointments
             WHERE doctor_id = $1 AND date = $2 AND time = $3
               AND status IN ('pending','confirmed')
             LIMIT 1`,
            [doctorId, date, time]
        );
        return rows[0] || null;
    },

    /**
     * Create a new appointment.
     */
    async create({ patient_id, patient_firebase_uid, patient_name, patient_phone, doctor_id, doctor_name, specialty, date, time, reason }) {
        const { rows } = await pool.query(
            `INSERT INTO appointments
               (patient_id, patient_firebase_uid, patient_name, patient_phone,
                doctor_id, doctor_name, specialty, date, time, reason)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [patient_id, patient_firebase_uid || null, patient_name, patient_phone,
             doctor_id, doctor_name, specialty || null, date, time, reason || null]
        );
        return rows[0];
    },

    /**
     * Update an appointment. Only updates allowed fields.
     */
    async update(id, fields) {
        const colMap = {
            date: 'date', time: 'time', status: 'status',
            notes: 'notes', patientName: 'patient_name',
            patientPhone: 'patient_phone', reason: 'reason',
        };
        const setClauses = [];
        const params = [];
        let i = 1;

        for (const [jsKey, col] of Object.entries(colMap)) {
            if (fields[jsKey] !== undefined) {
                setClauses.push(`${col} = $${i++}`);
                params.push(fields[jsKey]);
            }
        }
        if (setClauses.length === 0) return this.findById(id);

        setClauses.push(`updated_at = NOW()`);
        params.push(id);

        const { rows } = await pool.query(
            `UPDATE appointments SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
            params
        );
        return rows[0] || null;
    },

    /**
     * Count appointments with optional filter.
     */
    async count({ status, date, notStatus } = {}) {
        const conditions = [];
        const params = [];
        let i = 1;

        if (status)    { conditions.push(`status = $${i++}`);    params.push(status); }
        if (date)      { conditions.push(`date = $${i++}`);      params.push(date); }
        if (notStatus) { conditions.push(`status != $${i++}`);   params.push(notStatus); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const { rows } = await pool.query(
            `SELECT COUNT(*)::int AS count FROM appointments ${where}`,
            params
        );
        return rows[0].count;
    },

    /**
     * Get recent appointments (for admin activity feed).
     */
    async findRecent(limit = 5) {
        const { rows } = await pool.query(
            `SELECT id, patient_name, doctor_name, status, created_at
             FROM appointments ORDER BY created_at DESC LIMIT $1`,
            [limit]
        );
        return rows;
    },
};

module.exports = Appointment;
