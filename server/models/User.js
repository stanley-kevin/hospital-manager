const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebase_uid: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    phone: { type: String },
    password: { type: String, default: 'firebase-managed' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Configure Virtuals
userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const UserModel = mongoose.model('User', userSchema);

function toCleanJson(doc) {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    return obj;
}

const User = {
    async findByFirebaseUid(firebaseUid) {
        const doc = await UserModel.findOne({ firebase_uid: firebaseUid });
        return toCleanJson(doc);
    },

    async findByEmail(email) {
        const doc = await UserModel.findOne({ email });
        return toCleanJson(doc);
    },

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await UserModel.findById(id);
        return toCleanJson(doc);
    },

    async upsertByFirebaseUid({ firebaseUid, email, name }) {
        // Find existing by firebase_uid or email
        let doc = null;
        if (firebaseUid) {
            doc = await UserModel.findOne({ firebase_uid: firebaseUid });
        }
        if (!doc && email) {
            doc = await UserModel.findOne({ email });
        }

        if (doc) {
            // Update
            if (firebaseUid) doc.firebase_uid = firebaseUid;
            if (email) doc.email = email;
            if (name) doc.name = name;
            await doc.save();
        } else {
            // Create new
            doc = await UserModel.create({
                firebase_uid: firebaseUid,
                email,
                name,
                role: 'user',
                password: 'firebase-managed'
            });
        }
        return toCleanJson(doc);
    },

    async findAll({ role } = {}) {
        const query = role ? { role } : {};
        const docs = await UserModel.find(query).sort({ created_at: -1 });
        return docs.map(toCleanJson);
    },

    async deleteById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await UserModel.findByIdAndDelete(id);
        return toCleanJson(doc);
    },

    async countByRole(role) {
        return await UserModel.countDocuments({ role });
    },

    // Export raw model for Mongoose operations (e.g. seeding)
    rawModel: UserModel
};

module.exports = User;
