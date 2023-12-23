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
    firstName: String,
    lastName: String,
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
        type: [String],
        default: []
    },
    website: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
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
