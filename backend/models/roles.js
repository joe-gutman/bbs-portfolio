const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        enum: ['admin', 'editor', 'user'],
    },
    permissions: [{
        type: String,
        enum: ['createPost', 'deletePost', 'updatePost', 'createUser', 'deleteUser', 'updateUser', 'createComment', 'deleteComment', 'updateComment', 'createTag', 'deleteTag', 'updateTag'],
    }],
});

module.exports = mongoose.model('Role', roleSchema);