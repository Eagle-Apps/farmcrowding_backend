const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, trim: true, required: true },
    image: { type: String },
    phone: { type: String, minlength: 10, maxlength: 11 },
    address: { type: String, required: true },
    userName: { type: String, required: true, trim: true },
    role: { type: String, default: "user" },
    status: { type: String, default: "inactive" },
    investments: [{
        type: mongoose.Types.ObjectId,
        ref: "investments"
    }]
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.password;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const User = mongoose.model('users', UserSchema);

module.exports = User;