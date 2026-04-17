/**
 * Seed script — creates tables and populates PostgreSQL with initial data.
 * Run: npm run seed
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const doctors = [
    {
        name: 'Dr. Sarah Sharma',
        specialty: 'Cardiology',
        designation: 'Cardiologist',
        location: 'Mumbai',
        experience: '10+ years',
        availability: 'Mon–Fri',
        initials: 'SS',
        rating: 4.8,
        bio: 'Expert in cardiovascular diseases with 10+ years of clinical experience.',
    },
    {
        name: 'Dr. Rohan Kulkarni',
        specialty: 'Orthopedics',
        designation: 'Orthopedic Surgeon',
        location: 'Pune',
        experience: '8+ years',
        availability: 'Tue, Thu, Sat',
        initials: 'RK',
        rating: 4.7,
        bio: 'Specialist in joint replacement and sports injuries.',
    },
    {
        name: 'Dr. Aisha Patel',
        specialty: 'Dermatology',
        designation: 'Dermatologist',
        location: 'Chennai',
        experience: '6+ years',
        availability: 'Mon, Wed, Fri',
        initials: 'AP',
        rating: 4.6,
        bio: 'Skin care specialist with expertise in cosmetic and medical dermatology.',
    },
    {
        name: 'Dr. Meera Singh',
        specialty: 'Neurology',
        designation: 'Neurologist',
        location: 'Delhi',
        experience: '12+ years',
        availability: 'Mon, Wed, Fri',
        initials: 'MS',
        rating: 4.9,
        bio: 'Leading neurologist specialising in epilepsy and movement disorders.',
    },
    {
        name: 'Dr. Amit Kumar',
        specialty: 'Pediatrics',
        designation: 'Pediatrician',
        location: 'Bangalore',
        experience: '9+ years',
        availability: 'Mon–Fri',
        initials: 'AK',
        rating: 4.7,
        bio: 'Child health specialist dedicated to newborn and adolescent care.',
    },
    {
        name: 'Dr. Priya Nair',
        specialty: 'General Medicine',
        designation: 'General Physician',
        location: 'Hyderabad',
        experience: '7+ years',
        availability: 'Mon–Sat',
        initials: 'PN',
        rating: 4.5,
        bio: 'General physician with expertise in preventive care and chronic disease management.',
    },
];

const users = [
    {
        name: 'Admin',
        email: 'admin@hospital.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '9999999999',
    },
    {
        name: 'Test User',
        email: 'user@hospital.com',
        password: 'User@123',
        role: 'user',
        phone: '9876543210',
    },
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('✅ PostgreSQL connected');

        // Run schema SQL to create tables
        const schemaSql = fs.readFileSync(
            path.join(__dirname, 'config', 'schema.sql'),
            'utf8'
        );
        await client.query(schemaSql);
        console.log('📐 Tables verified / created');

        // Clear existing data (order matters due to FK constraints)
        await client.query('DELETE FROM appointments');
        await client.query('DELETE FROM doctors');
        await client.query('DELETE FROM users');
        // Reset sequences
        await client.query('ALTER SEQUENCE appointments_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE doctors_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        console.log('🗑️  Cleared existing data');

        // Insert users
        for (const u of users) {
            await client.query(
                `INSERT INTO users (name, email, password, role, phone)
                 VALUES ($1, $2, $3, $4, $5)`,
                [u.name, u.email, u.password, u.role, u.phone]
            );
        }
        console.log(`👥 Seeded ${users.length} users`);
        console.log('   👑 Admin:    admin@hospital.com  /  Admin@123');
        console.log('   👤 User:     user@hospital.com   /  User@123');

        // Insert doctors
        for (const d of doctors) {
            await client.query(
                `INSERT INTO doctors
                   (name, specialty, designation, location, experience, availability, initials, rating, bio)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [d.name, d.specialty, d.designation, d.location, d.experience, d.availability, d.initials, d.rating, d.bio]
            );
        }
        console.log(`👨‍⚕️  Seeded ${doctors.length} doctors`);

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        console.error(err);
        process.exit(1);
    } finally {
        client.release();
    }
}

seed();
