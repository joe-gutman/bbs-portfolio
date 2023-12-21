const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const request = require('supertest');
const serverPromise = require('../server.js');

describe('Environment Variables', () => {
    it('should load environment variables', () => {
        expect(process.env.DB_HOST).toBeDefined();
        expect(process.env.DB_PORT).toBeDefined();
        expect(process.env.DB_NAME).toBeDefined();
        expect(process.env.DB_USERNAME).toBeDefined();
        expect(process.env.DB_PASSWORD).toBeDefined();
    });
});

describe('Post API', () => {
    let server;

    beforeAll(async () => {
        server = await serverPromise;
    });
    
    it('should create a new post and return it', async () => {
        const newPost = {
            title: 'Test title',
            summary: 'Test summary',
            author: 'Test author',
            topic: 'Test topic',
            body: [{ type: 'Text', content: 'Test content', order: 1}, { type: 'Text', content: 'Test content 2', order: 2}, { type: 'Images', content: ['Test Image 1', 'Test Image 2'], order: 3}],
            tags: ['Test Tag1', 'Test Tag2', 'Test Tag3'],
        };
        
        newPost.wordCount = newPost.body.reduce((count, element) => { 
            if (element.type == 'Text') {
                return count + element.content.match(/(\w+)/g).length;
            } else {
                return count;
            }
        }, 0);

    
        const response = await request(server)
            .post('/post')
            .send(newPost);

        expect(response.statusCode).toBe(200);
        expect(response.body.post.title).toEqual(newPost.title);
        expect(response.body.post.summary).toEqual(newPost.summary);
        expect(response.body.post.author).toEqual(newPost.author);
        expect(response.body.post.tags).toEqual(newPost.tags);
        expect(response.body.post.wordCount).toEqual(newPost.wordCount);
        expect(response.body.post.readingTime).toEqual(Math.round((newPost.wordCount / 200)*60));
        expect(response.body.post.likes).toEqual(0);
        expect(response.body.post.views).toEqual(0);
        expect(response.body.post.datePosted).toBeDefined();

        response.body.post.body.forEach((item, index) => {
            expect(item.content).toEqual(newPost.body[index].content);
            expect(item.order).toEqual(newPost.body[index].order);
            expect(item.type).toEqual(newPost.body[index].type);
        });
    });

    afterAll(done => {
        server.close(done);
    });
});