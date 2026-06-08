const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Doctor = require('./models/Doctor');
    const docs = await Doctor.rawModel.find();
    console.log('--- Doctors in local database ---');
    console.log(docs.map(d => ({
      name: d.name,
      specialty: d.specialty,
      is_available: d.is_available,
      availability_status: d.availability_status
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
