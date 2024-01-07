const mongoose = require('mongoose');
const createDompurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');

const window = new JSDOM('').window;
const DOMPurify = createDompurify(window);


const Post = require('../models/post.js');

const sanitize = (element) => { 
    if (Array.isArray(element)) {
        let sanitizedElement = [];
        element.forEach((el) => {
            sanitizedElement.push(sanitize(el));
        });
        return sanitizedElement;
    } else {
        return DOMPurify.sanitize(element);
    }
}

const isValidId = (id) => {
    mongoose.Types.ObjectId.isValid(id);
};

exports.getPost = async (req, res) => { 
    try {
        const _id = req.params.id;
    
        if (!isValidId(_id)) {
            return res.status(400).json({ error: 'Invalid Post ID' });
        }
        
        const post = await Post.findOne({_id: _id});

        if (!post) {
            return res.status(404).json({error: "Post not found."});
        }

        return res.status(200).json({post});
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"})
    }
}

exports.getPosts = async (req, res) => {
    try {
        const type = req.query.type;
        const perPage = req.query.count || 5;
        const page = req.query.page || 1;
        const tag = req.query.topic;
        const sortby = req.query.sort;
        const order = req.query.order;

        let postsQuery = Post.find({ type: type, topic: { $in: [tag]}})

        if (sortby) {
            postsQuery = postsQuery.sort({[sortby]: order})
        }
        
        const posts = await postsQuery.limit(perPage).skip((page - 1 ) * perPage);

        if (posts.length == 0) {
            return res.status(404).json({error: "No posts found."});
        }
        
        res.status(200).json({posts});
    } catch (error) {
        console.error(error);
       return res.status(404).json({error: "No posts found."});
    }
}

exports.createPost = async (req, res) => {
    try {
        const wordCount = req.body.body.reduce((acc, element) => {
            if(element.type === 'Text') {
                return acc + element.content.match(/(\w+)/g).length;
            }
            return acc;
        }, 0);
        
        const newPost = {
            title: sanitize(req.body.title),
            summary: sanitize(req.body.summary),
            author: sanitize(req.body.author),
            body: req.body.body.map((element) => {
                element.content = sanitize(element.content);
                if (element.type === 'Text') {
                    element.htmlContent = marked(element.content);
                    element.htmlContent = sanitize(element.content);
                }
                return element;
            }),
            tags: sanitize(req.body.tags),
            wordCount: wordCount,
            readingTime: Math.round((wordCount / 200)*60),
        }   

        const savedPost = await new Post(newPost).save();

        return res.status(200).json({ post: savedPost, message: "Post created successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.updatePost = async (req, res) => {
    try {
        const postUpdate = {
            title: req.query.title,
            summary: req.query.summary,
            author: req.query.author,
            body: req.query.body,
            tags: req.query.tags,
            wordCount: Number(req.query.wordCount),
            readingTime: (Number(req.query.wordCount) / 200),
        }

        console.log(readingTime);

        const post = await Post.findOneAndUpdate({_id: _id}, post, {new: true});

        return res.status(200).json({ post: post, message: "Post updated successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.deletePost = async (req, res) => {
    try {
        const _id = req.params.id;

        const post = await Post.findOneAndDelete({_id: _id});

        return res.status(200).json({ post: post, message: "Post deleted successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.likePost = async (req, res) => {
    const _id = req.params.id;

    if (!isValidId(_id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const post = await Post.findOneAndUpdate({_id: _id}, {$inc: {likes: 1}}, {new: true});
        return res.status(200).json({post: post, message: "Post 'like' added successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.unlikePost = async (req, res) => {
    const _id = req.params.id;

    if (!isValidId(_id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const post = await Post.findOneAndUpdate({_id: _id}, {$inc: {likes: -1}}, {new: true});
        return res.status(200).json({post: post, message: "Post 'like' removed successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

exports.viewPost = async (req, res) => {
    const _id = req.params.id;

    if (!isValidId(_id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const post = await Post.findOneAndUpdate({_id: _id}, {$inc: {views: 1}}, {new: true});
        return res.status(200).json({post: post, message: "Post 'view' added successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}