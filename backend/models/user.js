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
    role: [{
        type: [String],
        default: [],
    }],
    securityQuestions: {
        type: Map,
        of: String,
    },
    loginHistory: {
        type:[Date],
        default: [],    
    },
    refreshToken: String,
});

module.exports = mongoose.model('User', userSchema);
