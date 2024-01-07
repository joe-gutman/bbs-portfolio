const rl = require('./readline.js');

const promptUser = (prompt) => {
    const formattedPrompt = '\n' + prompt;
    return new Promise((resolve) => rl.question(formattedPrompt, resolve));
};

const getUserInput = async (prompt) => {
    let response = await promptUser(prompt);

    return response.trim().toLowerCase();
};

module.exports = getUserInput;