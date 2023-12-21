const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.js')


// Get a single post by id
router.get('/post/:id', postsController.getPost);

// Get multiple posts by type, count, page, topic, sort, and order
router.get('/posts', postsController.getPosts);

// Create, delete, and update posts
router.post('/post', postsController.createPost);
router.delete('/post/:id', postsController.deletePost);
router.put('/post/:id', postsController.updatePost);

// Update likes and view counts
router.patch('/post/:id/like', postsController.likePost);
router.patch('/post/:id/unlike', postsController.unlikePost);
router.patch('/post/:id/view', postsController.viewPost);

module.exports = router;