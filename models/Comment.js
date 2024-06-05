const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment:{
        type: String,
        trim: true,
        required:[true, 'Please add a comment body']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    safe: {
        type: Boolean,
        default: false,
    },
    reports: [
        {
            user: {
                type: String,
            },
            reason: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model('Comment', CommentSchema);