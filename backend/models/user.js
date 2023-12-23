const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        type: required,
    },
    about: String,
    socialMedia: {
        type: [String]
        default: [];
    },
    website: String,
    sitePermissions: [{
        type: [String],
        default: [],
    }],
    loginHistory: {
        type:[Date],
        default: [],    
    },
    refreshToken: String,
    verificationToken: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetToken: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model('User', userSchema);
