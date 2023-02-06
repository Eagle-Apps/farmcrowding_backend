const mongoose = require('mongoose');

const SupplySchema = new mongoose.Schema({
    destination: { type: String, required: true, trim: true },
    location: { type: Array, required: true },
    origin: { type: String, required: true, trim: true },
    orderNumber: { type: String, required: true, trim: true },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    investment_id: {
        type: mongoose.Types.ObjectId,
        ref: "investments"
    }
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

const Category = mongoose.model('supply', SupplySchema);

module.exports = Category;