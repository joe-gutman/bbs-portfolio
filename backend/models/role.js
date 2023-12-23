const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    permissions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Permission',
        default: []
    }
});

module.exports = mongoose.model('Role', roleSchema);