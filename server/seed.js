/**
 * Seed script — creates collections and populates MongoDB with initial data.
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

dotenv.config();

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
        availability_status: 'Available',
        is_available: true
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
        availability_status: 'Available',
        is_available: true
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
        availability_status: 'Available',
        is_available: true
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
        availability_status: 'Available',
        is_available: true
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
        availability_status: 'Available',
        is_available: true
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
        availability_status: 'Available',
        is_available: true
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
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Clear existing collections using raw Mongoose models
        await Appointment.rawModel.deleteMany({});
        await Doctor.rawModel.deleteMany({});
        await User.rawModel.deleteMany({});
        console.log('🗑️  Cleared existing collections (appointments, doctors, users)');

        // Seed users
        const createdUsers = await User.rawModel.insertMany(users);
        console.log(`👥 Seeded ${createdUsers.length} users`);
        console.log('   👑 Admin:    admin@hospital.com  /  Admin@123');
        console.log('   👤 User:     user@hospital.com   /  User@123');

        // Seed doctors
        const createdDocs = await Doctor.rawModel.insertMany(doctors);
        console.log(`👨‍⚕️  Seeded ${createdDocs.length} doctors`);

        console.log('\n✅ MongoDB seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        console.error(err);
        process.exit(1);
    }
}

seed();
