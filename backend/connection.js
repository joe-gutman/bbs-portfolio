const { MongoClient } = require('mongodb');
require('dotenv').config();

const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT; 
const dbname = process.env.DB_NAME;
const dbusername = process.env.DB_USERNAME;
const dbpassword = process.env.DB_PASSWORD;




async function connectToDB() {
	const uri = `mongodb+srv://${dbusername}:${dbpassword}@${dbhost}:${dbport}/${dbname}?retryWrites=true&w=majority`;
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log(`Connected to DB at ${dbhost}:${dbport}`)
		return client;
	} catch (e) {
		console.error(`Error connecting to MongoDB:`, e);
		throw e;
	}
}

module.exports = { connectToDB };