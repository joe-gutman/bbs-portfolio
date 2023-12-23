const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.js');
const { route } = require('./users.js');

// Authenticate user, update user password, and handle continuous authentication
route.post('/user/login', usersController.login);
route.post('/user/logout', usersController.logout);
route.patch('/user/:id', usersController.updatePassword);
route.post('/user/refresh-token', usersController.refreshToken);
route.post('/user/register', usersController.register);
route.post('/user/authenticate', usersController.authenticate);


route.patch('user/update-email', usersController.updateEmail);
route.patch('user/update-password', usersController.updatePassword);

route.get('/user/verify-email', usersController.verifyEmail);
route.post('/user/forgot-password', usersController.forgotPassword);
route.post('/user/reset-password', usersController.resetPassword);