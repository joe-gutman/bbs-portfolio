const mongoose = require('mongoose');
const User = require('../models/user.js');

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.getUser = async (req, res) => { 
    try {
        const _id = req.params.id;
    
        if (!isValidId(_id)) {
            return res.status(400).json({ error: 'Invalid user id.'});
        }

        const user = await User.findOne({_id: _id}, '-password');

        if (!user) {
            return res.status(404).json({error: "User not found."});
        }

        return res.status(200).json({user, message: "User retrieved successfully."});
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }
} 

exports.updateUser = async (req, res) => {
    try {
        const _id = req.params.id;
    
        if (!isValidId(_id)) {
            return res.status(404).json({error: "User not found."});
        }

        const updatedUser = await User.findOneAndUpdate({_id: _id}, req.body, {new: true, select: '-password'});

        if (!updatedUser) {
            return res.status(404).json({error: "Error updating user."});
        } else {
            return res.status(200).json({user, message: "User updated successfully."});
        }
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.deleteUser = async (req, res) => { 
    try {
        const _id = req.params.id;
    
        if (!isValidId(_id)) {
            return res.status(404).json({error: "User not found."});
        }

        const user = await User.findOneAndDelete({_id: _id}, '-password');

        if (!user) {
            return res.status(404).json({error: "User not found."});
        } else {
            return res.status(200).json({user, message: "User deleted successfully."});
        }
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"});
    }
}