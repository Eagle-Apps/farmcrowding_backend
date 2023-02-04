const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, minlength: 8, trim: true, required: true },
    images: { type: Array },
    status: { type: String, default: "inactive", enum: ['inactive', 'active'], },
    verified: { type: Boolean, default: false },
    phone: { type: String, minlength: 10, maxlength: 11 },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "categories"
    },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const Farm = mongoose.model('farms', FarmSchema);

module.exports = Farm;