const rl = require('./readline.js');

const formatQuestion = (question, choices) => {
    choices = choices.map(choice => choice.charAt(0).toUpperCase() + choice.slice(1));

    question += choices.map((choice, index) => `\n${index + 1}. ${choice}`).join('');
    return question;
}

const askQuestion = (question) => {
    const formattedQuestion = '\n' + question + '\nEnter your choice: ';
    return new Promise((resolve) => rl.question(formattedQuestion, resolve));
};

const getChoices = async (question, choices, cancelText = 'Cancel', answerCount = 'single') => {
    if (cancelText !== null) {
        choices = [...choices, cancelText];
    }
    let response = await askQuestion(formatQuestion(question, choices));
    // split response into array of choices, if user entered a number then convert to choice, if user entered a string then leave as string
    response = response.split(',').map(choice => {
        //check if string choice is number
        if (!isNaN(choice)) {
            choice = parseInt(choice);
            //check if number is in range
            if (choice > 0 && choice <= choices.length) {
                return choices[choice - 1];
            } else {
                return null;
            }
        } else if (choices.includes(choice.trim().toLowerCase())) {
            choice = choice.trim().toLowerCase();
            return choice;
        } else {
            return null;
        }
    });

    //check if any choices were valid
    if (response.length === 0) {
        console.log('Please enter at least one choice.');
        return getChoices(question, choices, cancelText, answerCount);
    }

    // if user chose to cancel then return null
    if (response[0].toLowerCase() === cancelText.toLowerCase()) {
        return null;
    }

    // if any choices are invalid then ask again
    invalidChoices = response.filter(choice => choice === null);
    if (invalidChoices.length > 0) {
        console.log(`Invalid choice(s): Please try again.`);
        return getChoices(question, choices, cancelText, answerCount);
    }


    // if answerCount is single then make sure only one choice was entered
    if (answerCount === 'single') {
        if (response.length > 1) {
            console.log('Please enter only one choice.');
            return getChoices(question, choices, cancelText, answerCount);
        } else {
            return response;
        }
    // if answerCount is multiple then make sure at least one choice was entered
    } else if (answerCount === 'multiple') {
        if (response.length < 1) {
            console.log('Please enter at least one choice.');
            return getChoices(question, choices, cancelText, answerCount);
        } else {
            return response;
        }
    }
};

module.exports = getChoices;