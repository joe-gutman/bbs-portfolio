const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '.env')});

const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT; 
const dbname = process.env.DB_NAME;
const dbusername = process.env.DB_USERNAME;
const dbpassword = process.env.DB_PASSWORD;

// console.log('DB_HOST:', dbhost);
// console.log('DB_PORT:', dbport);
// console.log('DB_NAME:', dbname); 
// console.log('DB_USERNAME:', dbusername);
// console.log('DB_PASSWORD:', dbpassword);

let client;

async function connectToDB() {
	const uri = `mongodb://${encodeURIComponent(dbusername)}:${encodeURIComponent(dbpassword)}@${dbhost}:${dbport}/${dbname}?retryWrites=true&w=majority`;

	try {
		await mongoose.connect(uri);
		console.log(`Connected to DB at ${dbhost}:${dbport}`)
	} catch (e) {
		console.error(`Error connecting to MongoDB with Mongoose:`, e);
		throw e;
	}
}

module.exports = { connectToDB };