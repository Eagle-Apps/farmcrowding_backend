const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    amount: { type: String, required: true, trim: true },
    card_number: { type: String, required: true, trim: true },
    cvv: { type: String, required: true, trim: true },
    expiry_month: { type: String, required: true, trim: true },
    expiry_year: { type: String, required: true, trim: true },
    currency: { type: String, required: true, default: "NGN" },
    redirect_url: { type: String, },
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    enckey: { type: String, required: true },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    investmentId: {
        type: mongoose.Types.ObjectId,
        ref: "investments"
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.updatedAt;
            },
        },
        timestamps: true
    });

const Payment = mongoose.model('payment', PaymentSchema);

module.exports = Payment;