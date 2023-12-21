const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,

    },
    datePosted: {
        type: Date,
        default: Date.now,
    },
    readingTime: Number,
    likes: {
        type:Number,
        default: 0,
    },
    body: [{
        type: {
            type: String,
            enum: ['Text', 'Images', 'Call to Action', 'Download Url', 'Github Url'],
            required: true,
        },
        content: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        htmlContent: String, // Only for 'Text' type.
        order: { type: Number, required: true},
    }],
    tags: {
        type: [String],
        default: [],
    },
    views: {
        type: Number,
        default: 0,
    },
    wordCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Post', postSchema)