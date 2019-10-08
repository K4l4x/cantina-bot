const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');
const { LuisRecognizer } = require('botbuilder-ai');

const { Study } = require('../../model/study');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';
const OPEN_WORKER = 'openWorker';

const ANKER_PROMPT = 'ankerPrompt';
let ANKER_PROMPT_TEXT = 'Okay, leg los';

// End of strep tree.
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

class OpenCantinaWorkerDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || OPEN_CANTINA_WORKER_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new TextPrompt(ANKER_PROMPT));
        this.addDialog(new WaterfallDialog(OPEN_WORKER,
            [
                this.anker.bind(this),
                this.switchIntention.bind(this),
                this.openResults.bind(this)
            ]));
        this.initialDialogId = OPEN_WORKER;
    }

    async anker(step) {
        return await step.prompt(ANKER_PROMPT, {
            prompt: ANKER_PROMPT_TEXT
        });
    }

    async switchIntention(step) {
        if (this.luisRecognizer.isConfigured) {
            const luisResult = await this.luisRecognizer.executeQuery(step.context);
            if (LuisRecognizer.topIntent(luisResult) === 'isVegetarian') {
                console.log('[OpenCantinaDialog]: isVegetarian Intent hit.');
                studySample.isVegetarian = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegetarisch.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'isVegan') {
                console.log('[OpenCantinaDialog]: isVegan Intent hit.');
                studySample.isVegan = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegan';
            } else if (LuisRecognizer.topIntent(luisResult) === 'withoutMeets') {
                console.log('[OpenCantinaDialog]: withoutMeets Intent hit.');
                // Get the normalized value from luis to search in the
                // labels.
                const value = (luisResult.entities['Meets'][0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                studySample.notWantedMeets.push(value);
                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'noSupplements') {
                console.log('[OpenCantinaDialog]: noSupplements Intent hit.');
                // Get the normalized value from luis to search in the
                // labels.
                const value = (luisResult.entities['Supplements'][0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                studySample.other.push(value);
                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'hasAllergies') {
                console.log('[OpenCantinaDialog]: hasAllergies Intent hit.');

                // Get the normalized value from luis to search in the
                // allergiesRegister.
                const value = (luisResult.entities['Allergies'][0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                studySample.allergies.push(value);
                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'isFinished') {
                await step.context.sendActivity('okay, fertig');
                return await step.next('finished');
            } else {
                await step.context.sendActivity(
                    MessageFactory.text('hm, dass habe ich leider nicht' +
                        ' verstanden'));
            }
        }
        return await step.next();
    }

    async openResults(step) {
        if (typeof step.result === 'undefined') {
            // Just loop this dialog because the is not finished yet.
            return await step.replaceDialog(OPEN_CANTINA_WORKER_DIALOG, studySample);
        } else {
            if (step.result === 'finished') {
                await step.context.sendActivity(THANK_USER);
                return await step.replaceDialog(MATCHING_DISH_DIALOG, studySample);
            }
        }
    }
}

module.exports.OpenCantinaWorkerDialog = OpenCantinaWorkerDialog;