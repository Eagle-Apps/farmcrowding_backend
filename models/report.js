const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    message: { type: String, required: true, trim: true },
    progress: { type: String, required: true, trim: true },
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
                delete ret.updatedAt;
            },
        },
        timestamps: true
    });

const Report = mongoose.model('report', ReportSchema);

module.exports = Report;