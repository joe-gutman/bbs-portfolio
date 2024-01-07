const mongoose = require('mongoose');
const readline = require('readline');
const Role = require('../models/role.js');
const User = require('../models/user.js');
const { connectToDB } = require('../connection.js');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const displayRole = (role) => {
    console.log(`
        Name: ${role.roleName}
        Description: ${role.description}
        Permissions: ${role.permissions.join(', ')}
        `);
};

const askQuestion = (question, choices) => {
    let formattedQuestion = '\n' + question;
    if (choices) {
        formattedQuestion += choices.map((choice, index) => `\n  ${index + 1}. ${choice}`).join('');
        formattedQuestion += '\nEnter the number next to the action you want to perform: ';
    }
    return new Promise((resolve) => rl.question(formattedQuestion + ' ', resolve));
};

const formatPermissionName = (permission) => {
    return permission
        .split(/(?=[A-Z])/) // Split the string at uppercase letters
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' '); // Join the words with a space
};

const selectPermissions = async () => {
    const permissionsDict = Role.schema.path('permissions').caster.enumValues.reduce((obj, permission) => {
        obj[formatPermissionName(permission)] = permission;
        return obj;
    }, {}); //includes the permission and a formatted version of the permission name, example { 'Create Post': 'createPost' } and { 'Update Site Content': 'updateSiteContent' }

    let permissions;
    let validInput = false;

    while (!validInput) {
        try {
            const permissionChoices = await askQuestion('Enter the numbers corresponding to the permissions you want to add to the role, separated by commas, or type `all` to include all permissions:', Object.keys(permissionsDict));

            if (permissionChoices.trim().toLowerCase() === 'all') {
                permissions = Object.values(permissionsDict);
                validInput = true;
            } else if (permissionChoices === '' || permissionChoices === null || permissionChoices === undefined || permissionChoices === 'none') {
                throw new Error('You must select at least one permission.');
            } else {
                permissions = permissionChoices.split(',').map(choice => {
                    const index = Number(choice.trim()) - 1;
                    const permission = Object.keys(permissionsDict)[index];
                    if (index < 0 || index > Object.keys(permissionsDict).length - 1) {
                        throw new Error(`Invalid permission number: ${index}. Please enter numbers between 1 and ${Object.keys(permissionsDict).length}.`);
                    }
                    return permissionsDict[permission];
                });
                validInput = true;
            }
        } catch (error) {
            console.error('Input error:', error.message);
        }
    }

    return permissions;
};

const createRole = async () => {
    try {
        const roleName = (await askQuestion('Enter the name of the role:')).toLowerCase();
        const description = (await askQuestion('Enter a description for the role:')).toLowerCase();
        const permissions = await selectPermissions();

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

        rl.close();
        mongoose.connection.close();
    } catch (error) {
        console.error(`Error creating role: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
}

const updateRole = async () => {
    try {
        const roles = await Role.find({});
        const roleNames = roles.map(role => role.roleName);
        const role = roles[await askQuestion('Enter the number of the role you would like to update:', roleNames) - 1];
        
        let done = false;
        //loop question that lets user update different permission options until they are done
        while (!done) {
            console.log(`Updating Role:`);
            displayRole(role);
            
            const editOptions = ['Role Name', 'Description', 'Permissions', 'Cancel'];
            const editChoice = editOptions[await askQuestion('Enter the number of the option you would like to edit:', editOptions) - 1];
            
            if (editChoice === 'Cancel') {
                done = true;
                break;
            } else if (editChoice === 'Role Name') {
                const roleName = await askQuestion('Enter the new role name:');
                role.roleName = roleName;
            } else if (editChoice === 'Description') {
                const description = await askQuestion('Enter the new description:');
                role.description = description;
            } else if (editChoice === 'Permissions') {
                const permissions = await selectPermissions();
                role.permissions = permissions;
            }
            
            await role.save();
            console.log('role updated');
            displayRole(role);
            
            // ask if they are done updating the role
            const doneUpdating = await askQuestion('Are you done updating this role? (y/n):');
            if (doneUpdating.trim().toLowerCase() === 'y') {
                done = true;
            }
        }
    } catch (error) {
        console.error(`Error updating role: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
}

const replaceRole = async () => {
    try {
        const roles = await Role.find({});
        const roleNames = roles.map(role => role.roleName);
        const oldRole = roles[await askQuestion('Enter the number of the role you would like to replace:', roleNames) - 1];

        const newRoleName = (await askQuestion('Enter the name of the new role:')).toLowerCase();
        const description = (await askQuestion('Enter a description for the new role:')).toLowerCase();
        const permissions = await selectPermissions();

        

        const newRole = new Role({
            roleName: newRoleName,
            description,
            permissions,
        });

        await newRole.save();
        console.log(`Created new role ${newRole.roleName}`);

        await User.updateMany({ role: oldRole._id }, { role: newRole._id });

        await Role.deleteOne({_id: oldRole._id})
        console.log(`Replaced ${oldRole.roleName} with ${newRole.roleName}`);

        rl.close();
        mongoose.connection.close();
    } catch (error) {
        console.error(`Error replacing role: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
}

const deleteRole = async () => {
    try {
        const roles = await Role.find({});
        const roleNames = roles.map(role => role.roleName);
        const role = roles[await askQuestion('Enter the number of the role you would like to delete:', roleNames) - 1];

        // ask if they're sure, tell them it cant be undone
        const confirm = await askQuestion(`Are you sure you want to delete ${role.roleName}? This cannot be undone. (y/n): `);
    
        const count = await User.countDocuments({ role: role._id });
        if (count > 0) {
            if (confirm.trim().toLowerCase() === 'y') {
                const replaceAnswer = await askQuestion('Would you like to replace this role with another? (y/n):');
                let replacementRole;
                if (replaceAnswer.trim().toLowerCase() === 'y') {
                    const replacementRoles = roles.filter(r => r._id.toString() !== role._id.toString());
                    const replacementRoleName = replacementRoles[await askQuestion('Enter the number of the role you would like to replace this role with:', replacementRoles.map(r => r.roleName)) - 1];
                    replacementRole = roles.find(r => r.roleName === replacementRoleName);

                    if (!replacementRole) {
                        throw new Error('Invalid role number.');
                    } 
            
                    await User.updateMany({ role: role._id }, { role: replacementRole._id });
                } else {
                    await User.updateMany({ role: role._id }, { role: null });
                }
            
                // delete the role
            } else {
                console.log('Role deletion cancelled.');
                rl.close();
                mongoose.connection.close();
            }
        }

        await Role.deleteOne({_id: role._id});
        console.log(`Deleted ${role.roleName}`);
        rl.close();
        mongoose.connection.close();
    } catch (error) {
        console.error(`Error deleting role: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
}

const viewRoles = async () => {
    try {
        const roles = await Role.find({});
        roles.forEach((role, index) => {
            console.log(`
            Role: ${role.roleName}
            --------------------
            Description: ${role.description}
            Permissions: 
                ${role.permissions.join(', ')}
        `);
        });
        rl.close();
        mongoose.connection.close();
    } catch (error) {
        console.error(`Error viewing roles: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
}

const manageUsers = async () => {
    try {
        await connectToDB();
        const actions = [
            { name:'create', action: createRole },
            { name:'update', action: updateRole },
            { name:'replace', action: replaceRole },
            { name:'delete', action: deleteRole },
            { name:'view', action: viewRoles },
            { name:'cancel', action: () => {
                rl.close();
                mongoose.connection.close();
            }}

        let choice = (await askQuestion('\nWelcome to the Role Management System. What would you like to do?', actions.map((action, index) => {
            const actionName = actions[index].name;
            return actionName.charAt(0).toUpperCase() + actionName.slice(1) + " Role";
        }))).toLowerCase();
        
        let isValid = false;
        
        while (!isValid) {
            //check if number is valid and if so return the action
            if (!isNaN(parseInt(choice))) {
                const index = parseInt(choice) - 1;
                if (index < 0 || index >= actions.length) {
                    console.error('Error: Please enter a valid choice.');
                } else {
                    choice = actions[index];
                    isValid = true;
                }
            }
        }

        await choice.action();



    } catch (error) {
        console.error(`Error managing roles: ${error.message}`);
        rl.close();
        mongoose.connection.close();
    }
};

manageRoles();