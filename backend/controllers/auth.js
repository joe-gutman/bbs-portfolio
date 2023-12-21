const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const { body, validationResult } = require('express-validator');
require('dotenv').config();


// const isValidId = (id) => {
//     mongoose.Types.ObjectId.isValid(id);
// };

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

const validatePassword = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
}

exports.authenticate = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password; 

    try {
        const user = await User.findOne({username: username});
        const hashedPassword = user ? user.password : null;
        const isValidPassword = await validatePassword(password, hashedPassword);

        if(user && isValidPassword) {
            user.loginHistory.push(Date.now());
            await user.save();

            const accessToken = jwt.sign({username: username, _id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
            const refreshToken = jwt.sign({username: username, _id: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

            user.refreshToken = refreshToken;
            await user.save();

            const expirationTime = new Date().getTime() + 15 * 60 * 1000;

            return res.status(200).json({accessToken: accessToken, refreshToken: refreshToken, expiresIn: expirationTime, message: 'Authentication successful.'});
        } else {
            return res.status(404).json({ error: 'Invalid username or password.' });
        }
    } catch(error) {
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
    
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not provided.' });
        }

        const userPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ _id: userPayload._id });

        if (!user) {
            return res.status(404).json({ error: 'User not found.'})
        }

        const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
        const expirationTime = new Date().getTime() + 15 * 60 * 1000;

        return res.status(200).json({accessToken: accessToken, refreshToken: refreshToken, expiresIn: expirationTime, message: 'Token refreshed successfully.'});

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.registerUser = async (req, res) => {
    try {
        const username = req.body.username.trim();
    
        if (!validator.isLength(username, { min: 3, max: 20 })) {
            return res.status(400).json({ error: 'Username must be between 3 and 20 characters.' });
        }
        
        if (!validator.matches(username, /^[a-zA-Z0-9_]+$/)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores.' });
        }
        
        const newUser = new User ({
            username: username,
            password: await hashPassword(req.body.password),
            name: req.body.name,
            birthday: req.body.birthday,
            securityQuestions: req.body.securityQuestions,
        })

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.'})    
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'})
    }
}