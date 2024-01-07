const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const request = require('supertest');

const testPort = 5001;
const startServer = require('./server.js');
let server;

beforeAll(async () => {
    server = await startServer(testPort);
    global.request = request(server);
});

afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
});