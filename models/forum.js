const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    message: { type: String, required: true, trim: true },
    user_id: {
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

const Forum = mongoose.model('forum', ForumSchema);

module.exports = Forum;