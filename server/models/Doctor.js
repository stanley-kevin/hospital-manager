const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { 
        type: String, 
        required: true,
        enum: ['Cardiology', 'Orthopedics', 'Dermatology', 'Neurology', 'Pediatrics', 'General Medicine', 'Gynecology', 'ENT']
    },
    designation: { type: String },
    location: { type: String, required: true },
    experience: { type: String, default: '5+ years' },
    availability: { type: String, default: 'Mon–Fri' },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    is_available: { type: Boolean, default: true },
    bio: { type: String },
    photo_url: { type: String },
    initials: { type: String },
    email: { type: String },
    phone: { type: String },
    availability_status: { type: String, default: 'Available' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Configure Virtuals
doctorSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const DoctorModel = mongoose.model('Doctor', doctorSchema);

function toCleanJson(doc) {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    return obj;
}

const Doctor = {
    async findAll({ specialty, location, name } = {}) {
        const query = { is_available: true };

        if (specialty) {
            query.specialty = specialty;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const docs = await DoctorModel.find(query).sort({ name: 1 });
        return docs.map(toCleanJson);
    },

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await DoctorModel.findById(id);
        return toCleanJson(doc);
    },

    async create(data) {
        const availabilityStatus = data.availability_status || 'Available';
        const isAvailable = availabilityStatus === 'Available';

        const doc = await DoctorModel.create({
            name: data.name,
            specialty: data.specialty,
            designation: data.designation,
            location: data.location,
            experience: data.experience,
            availability: data.availability,
            rating: data.rating,
            is_available: isAvailable,
            bio: data.bio,
            photo_url: data.photo_url,
            initials: data.initials,
            email: data.email,
            phone: data.phone,
            availability_status: availabilityStatus
        });
        return toCleanJson(doc);
    },

    async update(id, fields) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        
        // Map camelCase fields to schema fields if needed
        const updatePayload = {};
        const allowed = ['name','specialty','designation','location','experience','availability','rating','is_available','bio','photo_url','initials','email','phone','availability_status'];
        
        allowed.forEach((key) => {
            const bodyKey = key === 'is_available' ? 'isAvailable'
                          : key === 'photo_url'    ? 'photoUrl'
                          : key;
            if (fields[bodyKey] !== undefined) {
                updatePayload[key] = fields[bodyKey];
            } else if (fields[key] !== undefined) {
                updatePayload[key] = fields[key];
            }
        });

        // If availability_status changes, sync is_available
        if (updatePayload.availability_status !== undefined) {
            updatePayload.is_available = updatePayload.availability_status === 'Available';
        }

        const doc = await DoctorModel.findByIdAndUpdate(id, updatePayload, { new: true });
        return toCleanJson(doc);
    },

    async softDelete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await DoctorModel.findByIdAndUpdate(id, { is_available: false, availability_status: 'Unavailable' }, { new: true });
        return toCleanJson(doc);
    },

    async count({ is_available } = {}) {
        const query = {};
        if (is_available !== undefined) {
            query.is_available = is_available;
        }
        return await DoctorModel.countDocuments(query);
    },

    async findRecent(limit = 3) {
        const docs = await DoctorModel.find().sort({ created_at: -1 }).limit(limit);
        return docs.map(toCleanJson);
    },

    // Export raw model
    rawModel: DoctorModel
};

module.exports = Doctor;
