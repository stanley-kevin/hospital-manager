const mongoose = require('mongoose');

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = 'mongodb://localhost:27017/hospitalappoint';

    try {
        console.log('⏳ Connecting to primary database...');
        const conn = await mongoose.connect(primaryUri);
        console.log(`✅ MongoDB Connected (Primary): ${conn.connection.host}`);
    } catch (err) {
        console.warn(`⚠️  Primary database connection failed: ${err.message}`);
        console.log(`⏳ Attempting fallback connection to local MongoDB: ${fallbackUri}`);
        try {
            const conn = await mongoose.connect(fallbackUri);
            console.log(`✅ MongoDB Connected (Local Fallback): ${conn.connection.host}`);
        } catch (fallbackErr) {
            console.error(`❌ Fallback database connection failed: ${fallbackErr.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
