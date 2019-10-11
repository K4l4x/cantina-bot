const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { Study } = require('../../model/study');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';

const OPEN_WORKER = 'openWorker';
const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';
const ANKER_PROMPT = 'ankerPrompt';
let ANKER_PROMPT_TEXT = 'Okay, leg los';
const NONE_TEXT = 'Hm, dass habe ich leider nicht verstanden';
// End of strep tree.
const THANK_USER = 'Klasse, vielen Dank! ' +
    'Lass mich kurz nach dem passenden Gericht suchen...';

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
                this.prepareResults.bind(this)
            ]));
        this.initialDialogId = OPEN_WORKER;
    }

    async anker(step) {
        return await step.prompt(ANKER_PROMPT, {
            prompt: MessageFactory.text(ANKER_PROMPT_TEXT)
        });
    }

    async switchIntention(step) {
        if (this.luisRecognizer.isConfigured) {
            step.values.study = new Study();
            const luisResult = await this.luisRecognizer.executeQuery(step.context);
            if (LuisRecognizer.topIntent(luisResult) === 'isVegetarian') {
                console.log('[OpenCantinaDialog]: isVegetarian Intent hit.');
                step.values.study.isVegetarian = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegetarisch.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'isVegan') {
                console.log('[OpenCantinaDialog]: isVegan Intent hit.');
                step.values.study.isVegan = true;
                ANKER_PROMPT_TEXT = 'Alles klar, vegan.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'withoutMeets') {
                console.log('[OpenCantinaDialog]: withoutMeets Intent hit.');
                // Get the normalized value from luis to search in the labels.
                let value = (luisResult.entities.Meets[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                step.values.study.notWantedMeets.push(value);
                this.checkKnownMeets(step.values.study);
                value = value.charAt(0).toUpperCase() + value.slice(1);
                ANKER_PROMPT_TEXT = 'Okay, kein ' + value;
            } else if (LuisRecognizer.topIntent(luisResult) === 'noSupplements') {
                console.log('[OpenCantinaDialog]: noSupplements Intent hit.');
                // Get the normalized value from luis to search in the labels.
                const value = (luisResult.entities.Supplements[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                step.values.study.supplements.push(value);
                ANKER_PROMPT_TEXT = 'Alles klar.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'hasAllergies') {
                console.log('[OpenCantinaDialog]: hasAllergies Intent hit.');
                // Get the normalized value from luis to search in the
                // allergiesRegister.
                const value = (luisResult.entities.Allergies[0]).toString();
                console.log('[OpenCantinaDialog] -> Normalized value: ' + value);
                step.values.study.allergies.push(value);
                ANKER_PROMPT_TEXT = 'Notiert.';
            } else if (LuisRecognizer.topIntent(luisResult) === 'isFinished') {
                return await step.next('finished');
            } else {
                await step.context.sendActivity(MessageFactory.text(NONE_TEXT));
            }
        }
        return await step.next();
    }

    checkKnownMeets(study) {
        console.log('[OpenCantinaDialog]: checking known meets...');
        // TODO: Should be outsourced to json.
        const meetsMain = ['rind', 'schwein', 'fisch', 'hähnchen', 'pork'];
        const beefList = ['kalb', 'hack', 'wurst', 'beef'];
        const porkList = ['hack', 'pulled pork', 'wurst', 'pork', 'spießbraten'];
        const fishList = ['scholle', 'barsch', 'kibbelinge', 'lachs'];
        const chickenList = ['hühnchen', 'hähnchen', 'chicken'];

        // Check all meets we know off.
        let meets = study.notWantedMeets;
        for (const meet of study.notWantedMeets) {
            if (meetsMain.includes(meet.toLowerCase())) {
                switch (meet.toLowerCase()) {
                case 'rind':
                    meets = meets.concat(beefList);
                    break;
                case 'schwein':
                case 'pork':
                    meets = meets.concat(porkList);
                    break;
                case 'fisch':
                    meets = meets.concat(fishList);
                    break;
                case 'hähnchen':
                    meets = meets.concat(chickenList);
                    break;
                }
            }
        }
        study.notWantedMeets = meets;
    }

    async prepareResults(step) {
        if (typeof step.result === 'undefined') {
            console.log('[OpenCantinaDialog]: step.result is undefined =>' +
                ' run replaceDialog to loop this.');
            // Just loop this dialog because the is not finished yet.
            return await step
                .replaceDialog(OPEN_CANTINA_WORKER_DIALOG, step.values.study);
        } else {
            if (step.result === 'finished') {
                console.log('[OpenCantinaDialog]: step.result is finished =>' +
                    ' run replaceDialog to have studyDialog as parent on the' +
                    ' stack.');
                await step.context.sendActivity(MessageFactory.text(THANK_USER));
                return await step
                    .replaceDialog(MATCHING_DISH_DIALOG, step.values.study);
            }
        }
    }
}

module.exports.OpenCantinaWorkerDialog = OpenCantinaWorkerDialog;
