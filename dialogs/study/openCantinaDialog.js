const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');
const { LuisRecognizer } = require('botbuilder-ai');

const { Study } = require('../../model/study');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN = 'open';

const WELCOME_TO_DIALOG = MessageFactory.text('');

const THANK_USER = MessageFactory.text('Das war\'s schon, vielen Dank! ' +
    'Lass mich kurz nach dem passenden Gericht suchen...');

const studySample = {
    likesMeet: false,
    isVegetarian: false,
    isVegan: false,
    notWantedMeets: [],
    allergies: [],
    other: [],
    cantina: {}
};

class OpenCantinaDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || OPEN_CANTINA_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new WaterfallDialog(OPEN,
            [
                this.welcomeUser.bind(this),
                this.openResults.bind(this)
            ]));
        this.initialDialogId = OPEN;
    }

    // if (this.luisRecognizer.isConfigured) {
    //     const luisResult = await this.luisRecognizer.executeQuery(step.context);
    //     if (LuisRecognizer.topIntent(luisResult) === 'Greeting') {
    //         await step.context.sendActivity(
    //             MessageFactory.text('Hit Greeting Intent'));
    //     } else {
    //         await step.context.sendActivity(
    //             MessageFactory.text('None Intent hit'));
    //     }
    // }
    async welcomeUser(step) {
        await step.context.sendActivity(WELCOME_TO_DIALOG);
        return await step.next();
    }

    async openResults(step) {
        // await step.context.sendActivity(MessageFactory
        //     .text(JSON.stringify(studySample)));

        // TODO: Should have two options:
        //  1) Just end this dialog and start the matchingDialog (go back to
        //  studyDialog with result?)
        //  2) Loop this dialog to reuse the code for more "data mining"
        //  with LUIS.
        await step.context.sendActivity(THANK_USER);
        return await step.endDialog(MATCHING_DISH_DIALOG, studySample);
    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
