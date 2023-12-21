const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.js');
const { route } = require('./users.js');

// Authenticate user, update user password, and handle continuous authentication
route.post('/user/authenticate', usersController.authenticate);
route.patch('/user/:id', usersController.updatePassword);
route.post('/user/refresh-token', usersController.refreshToken);
route.post('/user/register', usersController.register);
