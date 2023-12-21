const express = require('express');
const routes = require('./routes/posts.js');
const bodyParser = require('body-parser'); 
const { connectToDB } = require('./connection.js');
require('dotenv').config();

const port = process.env.PORT || 3000;

const app = express();
let server;

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
app.use(bodyParser.json());
app.use('/', routes);


async function startServer() {
    try {
        await connectToDB();
        
        server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
    }

}

const serverPromise = startServer();

module.exports = serverPromise;