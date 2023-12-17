const express = require('express');
const router = express.Router();
const postsController = require('./controllers/posts.js')


// Get a single post by id
router.get('/post/:id', postsController.getPost);

// Get multiple posts by type, count, page, topic, sort, and order
router.get('/posts', postsController.getPosts);

module.exports = router;