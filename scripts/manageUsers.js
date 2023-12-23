const readline = require('readline');
const User = require('backend/models/user.js');
const Role = require('backend/models/role.js');
const { callbackify } = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const formatQuestionChoices = (question, choices) => {
    question += choices.map((choice, index) => `\n${index + 1}. ${choice}`).join('');
    return question;
}

const deleteUser = (user) => {
    // ask if they're sure, tell them it cant be undone
    rl.question(`Are you sure you want to delete ${user.username}? This cannot be undone. (y/n)`, async (answer) => {
        try {
            if (answer === 'y') {
                await User.deleteOne({_id: user._id})
                console.log(`Deleted ${user.username}`);
                rl.close();
            }
        } catch (error) {
            console.error(`Error deleting user: ${error.message}`);
            rl.close();
        }
    });
};

const assignRole = async (user) => {
    try {
        await Role.find({})
            .then(roles => {
                const roleNames = roles.map(role => role.roleName);
                let question = formatQuestionChoices(`Enter the number of the role you would like to assign to ${user.username}:`, roleNames);

                rl.question(question, async (roleNumber) => {
                    try {
                        const role = roles[roleNumber - 1];
                        user.roles.push(role._id);
                        await user.save();
                        console.log(`Assigned ${role.roleName} to ${user.username}`);
                        rl.close();
                    } catch (error) {
                        console.error(`Error assigning role: ${error.message}`);
                        rl.close();
                    }
                });
            })
    } catch (error) {
        console.error(`Error finding roles: ${error.message}`);
        rl.close();
    }
};

const removeRole = async (user) => {
    try {
        if (user.roles.length === 0) {
            console.log(`${user.username} has no roles to remove.`);
            rl.close();
            return;
        } else if (user.roles.length === 1) {
            console.log(`${user.username} has only one role. You cannot remove it.`);
            rl.close();
            return;
        } else {
            const roles = await Role.find({_id: {$in: user.roles}});
            const roleNames = roles.map(role => role.roleName);
            const question = formatQuestionChoices(`Enter the number of the role you would like to remove from ${user.username}:`, roleNames);

            rl.question(question, async (roleNumber) => {
                try {
                    const role = roles[roleNumber - 1];
                    user.roles.pull(role._id);
                    await user.save();
                    console.log(`Removed ${role.roleName} from ${user.username}`);
                    rl.close();
                } catch (error) {
                    console.error(`Error removing role: ${error.message}`);
                    rl.close();
                }
            }); 
        }
    } catch (error) {
        console.error(`Error finding roles: ${error.message}`);
        rl.close();
    }
};



const promptUserAction = (user) => {
    const actions = [ ['delete user',deleteUser], ['assign role', assignRole], ['remove role', removeRole] ];
    const question = formatQuestionChoices('Enter the number of action you would like to perform:', actions.map(action => action[0]));

    rl.question(question, (actionNumber) => {
        const action = actions[actionNumber - 1][1];
        if (!action) {
            console.error('Invalid choice. Please try again.');
            promptUserAction(user);
            return;
        }
        action(user);
    });
};


const chooseUser = (users) => {
    rl.question('Enter the number of the user you would like to manage: ', (userNumber) => {
        const user = users[userNumber - 1];
        if (!user) {
            console.error('Invalid choice. Please try again.');
            search();
            return;
        }

        promptUserAction(user);
    });
};


const search = () => {
    rl.question('Search for the user you would like to manage. You can search by: \n-username \n-email \n-first name \n-last name \n-roles ', async (search) => {
        try {
            const users = await User.find({$or: [
                {username: search},
                {email: search},
                {firstName: search},
                {lastName: search},
                {roles: search},
            ]});

            if (users.length === 0) {
                console.log('No users found.');
                rl.close();
                return;
            } if (users.length === 1) {
                rl.question(`1 user found: ${users[0].username}. Would like to manage this user? (y/n)`, (answer) => {
                    if (answer === 'y') {
                        promptUserAction(users[0]);
                        return;
                    } else {
                        search();
                        return; 
                    }
                });
            }
    
            for (let i = 0; i < users.length; i++) {
                const padding = ' '.repeat((i + 1).toString().length); 
                console.log(`${i + 1}. username: ${users[i].username} \n${padding} email: ${users[i].email} \n${padding} first name: ${users[i].firstName} \n${padding} last name: ${users[i].lastName}`);
            }
    
            chooseUser(users);
        } catch (error) {
            console.error(`Error searching for users: ${error.message}`);
            rl.close();
        }
    });
};

search();