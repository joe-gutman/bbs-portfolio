const mongoose = require('mongoose');
const Role = require('../../../models/role.js');
const getChoices = require('../utils/getChoices.js');
const getUserInput = require('../utils/getUserInput.js');

const getPermissions = () => {
    permissions = Role.schema.path('permissions').enumValues;

    return permissions.map(permission => {
        return permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    });
}


const createRole = async () => {
    try {
        const roleName = await getUserInput('Enter a name for the role:');
        const description = (await getUserInput('Enter a description for the role:'));

        const permissions = await getChoices('Select permissions for the role:', getPermissions())

        const role = new Role({
            roleName,
            description,
            permissions,
        });

        await role.save();

        //find role that was just created
        const newRole = await Role.findOne({ roleName: role.roleName });

        console.log('New Role Created');
        displayRole(newRole);
    } catch (error) {
        console.error(`Error creating role: ${error.message}`);
    }
}

module.exports = createRole;