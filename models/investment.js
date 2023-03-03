const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    images: { type: Array },
    descp: { type: String },
    status: { type: String, default: "inactive", enum: ['inactive', 'active'] },
    verified: { type: Boolean, default: false },
    phone: { type: String, minlength: 10, maxlength: 11 },
    rating: { type: Number, min: 1, max: 5 },
    cycle: { type: String },
    duration: { type: String },
    progress: { type: String, default: "0%" },
    createdBy: { type: String, default: "farmer", enum: ["farmer", "land owner", "money investor", "farmer and land owner"] },
    budget: { type: String },
    available: { type: String },
    roi: { type: String },
    terms: { type: String },
    ownerId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    ownerCommitment: {
        type: String
    },
    category: [{
        type: mongoose.Types.ObjectId,
        ref: "categories"
    }],
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

const Investment = mongoose.model('investments', InvestmentSchema);

module.exports = Investment;