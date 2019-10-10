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

const study = {
    likesMeet: false,
    isVegetarian: false,
    isVegan: false,
    notWantedMeets: [],
    allergies: [],
    supplements: [],
    cantina: {}
};

const meetsMain = ['rind', 'schwein', 'fisch', 'hähnchen', 'pork'];
const beefList = ['kalb', 'hack', 'wurst', 'beef'];
const porkList = ['hack', 'pulled pork', 'wurst', 'pork', 'spießbraten'];
const fishList = ['scholle', 'barsch', 'kibbelinge', 'lachs'];
const chickenList = ['hühnchen', 'hähnchen', 'chicken'];

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
                study.isVegetarian = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegetarisch.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'isVegan') {
                console.log('[OpenCantinaDialog]: isVegan Intent hit.');
                study.isVegan = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegan';
            } else if (LuisRecognizer.topIntent(luisResult) === 'withoutMeets') {
                console.log('[OpenCantinaDialog]: withoutMeets Intent hit.');
                // Get the normalized value from luis to search in the
                // labels.
                const value = (luisResult.entities.Meets[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                study.notWantedMeets.push(value);

                let tmp = study.notWantedMeets;
                for (const meet of study.notWantedMeets) {
                    if (meetsMain.includes(meet.toLowerCase())) {
                        switch (meet.toLowerCase()) {
                        case 'rind':
                            tmp = tmp.concat(beefList);
                            break;
                        case 'schwein':
                        case 'pork':
                            tmp = tmp.concat(porkList);
                            break;
                        case 'fisch':
                            tmp = tmp.concat(fishList);
                            break;
                        case 'hähnchen':
                            tmp = tmp.concat(chickenList);
                            break;
                        }
                    }
                }
                study.notWantedMeets = tmp;

                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'noSupplements') {
                console.log('[OpenCantinaDialog]: noSupplements Intent hit.');
                // Get the normalized value from luis to search in the
                // labels.
                const value = (luisResult.entities.Supplements[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                study.supplements.push(value);
                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'hasAllergies') {
                console.log('[OpenCantinaDialog]: hasAllergies Intent hit.');
                // Get the normalized value from luis to search in the
                // allergiesRegister.
                const value = (luisResult.entities.Allergies[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                study.allergies.push(value);
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
            return await step.replaceDialog(OPEN_CANTINA_WORKER_DIALOG, study);
        } else {
            if (step.result === 'finished') {
                await step.context.sendActivity(THANK_USER);
                return await step.replaceDialog(MATCHING_DISH_DIALOG, study);
            }
        }
    }
}

module.exports.OpenCantinaWorkerDialog = OpenCantinaWorkerDialog;
