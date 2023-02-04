const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    password: { type: String, minlength: 8, trim: true, required: true },
    images: { type: Array },
    status: { type: String, default: "inactive", enum: ['inactive', 'active'] },
    verified: { type: Boolean, default: false },
    phone: { type: String, minlength: 10, maxlength: 11 },
    rating: { type: Number, min: 1, max: 5 },
    budget: { type: String },
    owner: {
        ownerId: {
            type: mongoose.Types.ObjectId,
            ref: "users"
        },
        commitment: { type: String }
    },
    category: [{
        type: mongoose.Types.ObjectId,
        ref: "categories"
    }],
    subscribers: [{
        subId: {
            type: mongoose.Types.ObjectId,
            ref: "users"
        },
        role: { type: String },
        commitment: { type: String },
        status: { type: String, enum: ["pending", "participant"], default: "pending" }
    }]
    ,
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