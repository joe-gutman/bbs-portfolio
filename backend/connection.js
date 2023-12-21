const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT; 
const dbname = process.env.DB_NAME;
const dbusername = process.env.DB_USERNAME;
const dbpassword = process.env.DB_PASSWORD;

let client;

async function connectToDB() {
	const uri = `mongodb://${dbusername}:${dbpassword}@${dbhost}:${dbport}/${dbname}?retryWrites=true&w=majority`;

	try {
		await mongoose.connect(uri);
		console.log(`Connected to DB at ${dbhost}:${dbport}`)
	} catch (e) {
		console.error(`Error connecting to MongoDB with Mongoose:`, e);
		throw e;
	}
}

module.exports = { connectToDB };