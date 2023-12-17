const  mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    rolename: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    permissions: [{
        type: String,
        enum: ['createPost','editPost','deletePost', 'editWebText'],
    }]
});

module.exports = mongoose.model('Role', roleSchema);

