const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    permissions: [{
        type: String,
        enum: ['createPost', 'deletePost', 'updatePost', 'createUser', 'deleteUser', 'updateUser', 'createComment', 'deleteComment', 'updateComment', 'createRole', 'deleteRole', 'updateRole', 'updateSiteContent'],
        default: []
    }]
});

module.exports = mongoose.model('Role', roleSchema);