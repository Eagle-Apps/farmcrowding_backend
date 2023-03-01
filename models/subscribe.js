const mongoose = require('mongoose');

const SubscribeSchema = new mongoose.Schema({
    investmentId: { type: mongoose.Types.ObjectId, ref: "investments" },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    role: { type: String, enum: ["farmer", "land owner", "money investor", "farmer and land owner"] },
    commitment: { type: String },
    status: { type: String, enum: ["pending", "participant", "declined"], default: "pending" }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true
    });

const Subscribe = mongoose.model('subscribers', SubscribeSchema);

module.exports = Subscribe;