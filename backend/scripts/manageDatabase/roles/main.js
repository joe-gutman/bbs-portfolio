const getChoices = require('../utils/getChoices.js');
const createRole = require('../roles/createRole.js');
// const updateRole = require('./roles/updateRole.js');
// const replaceRole = require('./roles/replaceRole.js');
// const deleteRole = require('./roles/deleteRole.js');
// const viewRoles = require('./roles/viewRoles.js');

const manageRoles = async () => {
    const options = { 
        "create role": createRole, 
        // "update role": updateRole,
        // "replace role": replaceRole, 
        // "delete role": deleteRole, 
        // "view role": viewRoles
    };

    try {
        const userChoice = await getChoices('How do you want to manage roles?', Object.keys(options), 'Cancel');

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

module.exports = manageRoles;