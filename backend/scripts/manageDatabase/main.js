const manageUsers = require('./users/main.js');
const manageRoles = require('./roles/main.js');
const getChoices = require('./utils/getChoices.js');
const { connectToDB } = require('../../connection.js');

const connectDB = async () => {
    try {
        await connectToDB();
        // console.log('MongoDB Connected...');
        main();
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

const main = async () => {
    const options = { users: manageUsers, roles: manageRoles };

    try {
        let userChoice = await getChoices('What would you like to manage?', Object.keys(options), 'Exit');

        if (!userChoice) {
            process.exit(0);
        } else {
            const option = options[userChoice];
            console.log(option);
            option();
        }
        
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

connectDB();