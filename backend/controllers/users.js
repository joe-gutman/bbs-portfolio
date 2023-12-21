const mongoose = require('mongoose');
const User = require('../models/user.js');

const isValidId = (id) => {
    mongoose.Types.ObjectId.isValid(id);
};

exports.getUser = async (req, res) => { 
    const _id = req.params.id;

    if (!isValidId) {
        return res.Status(400).json({ error: 'Invalid user id.'});
    }

    try {
        const user = await User.findOne({_id: _id}, '-password');

        if (!user) {
            return res.status(404).json({error: "User not found."});
        }

        return res.status(200).json({user});
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }
} 

exports.createUser = async (req, res) => {

}