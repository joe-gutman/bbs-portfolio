const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.js');

// Get, create, delete, and update a user by id
router.get('/user/:id', usersController.getUser);
router.post('/user', usersController.registerUser);
router.delete('/user/:id', usersController.deleteUser);
router.put('/user/:id', usersController.updateUser);

// Get user roles by id
router.get('/user/:id/roles', usersController.getUserRoles);

//update user roles
router.patch('/user/:id/roles', usersController.updateRoles);

module.exports = router;
