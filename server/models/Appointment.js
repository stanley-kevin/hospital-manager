const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient_firebase_uid: { type: String },
    patient_name: { type: String, required: true },
    patient_email: { type: String },
    patient_phone: { type: String, required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctor_name: { type: String, required: true },
    specialty: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String },
    notes: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Configure Virtuals
appointmentSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

function toCleanJson(doc) {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    if (obj.patient_id) obj.patient_id = obj.patient_id.toString();
    if (obj.doctor_id) obj.doctor_id = obj.doctor_id.toString();
    // Support camelCase properties for the frontend
    obj.doctorName = obj.doctor_name;
    obj.patientName = obj.patient_name;
    obj.patientPhone = obj.patient_phone;
    obj.patientEmail = obj.patient_email;
    obj.email = obj.patient_email || '';
    return obj;
}

const Appointment = {
    async findByPatient({ userId, firebaseUid, email }) {
        const query = {};
        const orConditions = [];

        if (mongoose.Types.ObjectId.isValid(userId)) {
            orConditions.push({ patient_id: userId });
        }
        if (firebaseUid) {
            orConditions.push({ patient_firebase_uid: firebaseUid });
        }
        if (email) {
            orConditions.push({ patient_email: email });
        }

        if (orConditions.length === 0) {
            return [];
        }
        query.$or = orConditions;

        const docs = await AppointmentModel.find(query).sort({ created_at: -1 });
        return docs.map(toCleanJson);
    },

    async findAll({ status, date } = {}) {
        const query = {};
        if (status) query.status = status;
        if (date) query.date = date;

        const docs = await AppointmentModel.find(query)
            .populate('patient_id')
            .sort({ created_at: -1 });

        return docs.map((doc) => {
            const obj = toCleanJson(doc);
            // Replicate PostgreSQL join fields for backward compatibility
            if (doc.patient_id) {
                obj.patient_user_name = doc.patient_id.name;
                obj.patient_user_email = doc.patient_id.email || doc.patient_email || '';
                obj.patient_user_phone = doc.patient_id.phone;
            } else {
                obj.patient_user_name = doc.patient_name;
                obj.patient_user_email = doc.patient_email || '';
                obj.patient_user_phone = doc.patient_phone;
            }
            return obj;
        });
    },

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await AppointmentModel.findById(id);
        return toCleanJson(doc);
    },

    async findDuplicate({ doctorId, date, time }) {
        if (!mongoose.Types.ObjectId.isValid(doctorId)) return null;
        const doc = await AppointmentModel.findOne({
            doctor_id: doctorId,
            date,
            time,
            status: { $in: ['pending', 'confirmed'] }
        });
        return toCleanJson(doc);
    },

    async create({ patient_id, patient_firebase_uid, patient_name, patient_email, patient_phone, doctor_id, doctor_name, specialty, date, time, reason }) {
        const doc = await AppointmentModel.create({
            patient_id,
            patient_firebase_uid,
            patient_name,
            patient_email,
            patient_phone,
            doctor_id,
            doctor_name,
            specialty,
            date,
            time,
            reason
        });
        return toCleanJson(doc);
    },

    async update(id, fields) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        const colMap = {
            date: 'date', time: 'time', status: 'status',
            notes: 'notes', patientName: 'patient_name',
            patientPhone: 'patient_phone', reason: 'reason',
        };
        const updatePayload = {};
        for (const [jsKey, col] of Object.entries(colMap)) {
            if (fields[jsKey] !== undefined) {
                updatePayload[col] = fields[jsKey];
            }
        }
        if (fields.status !== undefined) {
            updatePayload.status = fields.status;
        }

        const doc = await AppointmentModel.findByIdAndUpdate(id, updatePayload, { new: true });
        return toCleanJson(doc);
    },

    async count({ status, date, notStatus } = {}) {
        const query = {};
        if (status) query.status = status;
        if (date) query.date = date;
        if (notStatus) query.status = { $ne: notStatus };

        return await AppointmentModel.countDocuments(query);
    },

    async findRecent(limit = 5) {
        const docs = await AppointmentModel.find().sort({ created_at: -1 }).limit(limit);
        return docs.map(toCleanJson);
    },

    // Export raw model
    rawModel: AppointmentModel
};

module.exports = Appointment;
