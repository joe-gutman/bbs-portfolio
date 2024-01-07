const express = require('express');
const routes = require('./routes/posts.js');
const bodyParser = require('body-parser'); 
const { connectToDB } = require('./connection.js');
require('dotenv').config();

const app = express();
let server;

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
app.use(bodyParser.json());
app.use('/', routes);


async function startServer(port = process.env.PORT || 3000) {
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

module.exports = startServer;