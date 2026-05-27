const { Pool } = require('pg');

// Fix DATABASE_URL for local dev:
// Neon requires channel_binding=require for Vercel, but it can cause
// ETIMEDOUT locally. Strip it out and use ssl: { rejectUnauthorized: false }.
const rawUrl = (process.env.DATABASE_URL || '')
    .replace('channel_binding=require&', '')
    .replace('&channel_binding=require', '')
    .replace('channel_binding=require', '');

const pool = new Pool({
    connectionString: rawUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL Connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;
