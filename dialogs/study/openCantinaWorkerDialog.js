const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { JsonOps } = require('../../utilities/jsonOps');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';

const OPEN_WORKER = 'openWorker';
const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';

const ANKER_PROMPT = 'ankerPrompt';
// No prompt message, because we need to change it some times.
const IS_VEGETARIAN_TEXT = 'Alles klar, vegetarische' +
    ' Gerichte.';
const IS_VEGAN_TEXT = 'Alles klar, veganes Essen.';
const NO_SUPPLEMENTS_TEXT = 'Alles klar.';
const HAS_ALLERGIES_TEXT = 'Notiert.';

const NONE_TEXT = 'Hm, dass habe ich leider nicht' +
    ' verstanden';
// End of step tree.
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
                this.prepareStep.bind(this)
            ]));
        this.initialDialogId = OPEN_WORKER;
    }

    async anker(step) {
        const study = step.options;
        return await step.prompt(ANKER_PROMPT, {
            prompt: study.ankerPrompt
        });
    }

    async switchIntention(step) {
        const study = step.options;
        if (this.luisRecognizer.isConfigured) {
            const luisResult = await this.luisRecognizer.executeQuery(step.context);
            if (LuisRecognizer.topIntent(luisResult) === 'isVegetarian') {
                study.isVegetarian = true;
                study.ankerPrompt = MessageFactory.text(IS_VEGETARIAN_TEXT);
            } else if (LuisRecognizer.topIntent(luisResult) === 'isVegan') {
                study.isVegan = true;
                study.ankerPrompt = MessageFactory.text(IS_VEGAN_TEXT);
            } else if (LuisRecognizer.topIntent(luisResult) === 'withoutMeets') {
                // Get the normalized value from luis to search in the labels.
                let value = (luisResult.entities.Meet[0]).toString();
                study.notWantedMeets.push(value);
                await this.checkKnownMeets(study);
                value = value.charAt(0).toUpperCase() + value.slice(1);
                study.ankerPrompt = MessageFactory
                    .text('Okay, ich lasse ' + value + ' weg.');
            } else if (LuisRecognizer.topIntent(luisResult) === 'noSupplements') {
                // Get the normalized value from luis to search in the labels.
                const value = (luisResult.entities.Supplements[0]).toString();
                study.supplements.push(value);
                study.ankerPrompt = MessageFactory.text(NO_SUPPLEMENTS_TEXT);
            } else if (LuisRecognizer.topIntent(luisResult) === 'hasAllergies') {
                // Get the normalized value from luis to search in the
                // allergiesRegister.
                const value = (luisResult.entities.Allergies[0]).toString();
                study.allergies.push(value);
                study.ankerPrompt = MessageFactory.text(HAS_ALLERGIES_TEXT);
            } else if (LuisRecognizer.topIntent(luisResult) === 'isFinished') {
                step.values.study = study;
                return await step.next('finished');
            } else {
                study.ankerPrompt = MessageFactory.text(NONE_TEXT);
            }
        }
        return await step.next(study);
    }

    async checkKnownMeets(study) {
        // TODO: Should be done only once.
        const meetParts = await JsonOps.prototype
            .loadFrom('utilities', 'meetParts');

        // Check all meets we know off.
        let meets = study.notWantedMeets;
        for (const meet of study.notWantedMeets) {
            if (meetParts.main.includes(meet.toLowerCase())) {
                switch (meet.toLowerCase()) {
                case 'rind':
                    meets = meets.concat(meetParts.beef);
                    break;
                case 'schwein':
                    meets = meets.concat(meetParts.pork);
                    break;
                case 'fisch':
                    meets = meets.concat(meetParts.fish);
                    break;
                case 'geflügel':
                    meets = meets.concat(meetParts.poultry);
                    break;
                }
            }
        }
        study.notWantedMeets = meets;
    }

    async prepareStep(step) {
        if (typeof step.result === 'object') {
            const study = step.result;
            console.log('[OpenCantinaDialog]: step.result is object =>' +
                ' run replaceDialog to loop this.');
            // Just loop this dialog because the is not finished yet.
            return await step
                .replaceDialog(OPEN_CANTINA_WORKER_DIALOG, study);
        } else {
            if (step.result === 'finished') {
                const study = step.values.study;
                console.log('[OpenCantinaDialog]: step.result is finished =>' +
                    ' run replaceDialog to have studyDialog as parent on the' +
                    ' stack.');
                await step.context.sendActivity(MessageFactory.text(THANK_USER));
                return await step
                    .replaceDialog(MATCHING_DISH_DIALOG, study);
            }
        }
    }
}

module.exports.OpenCantinaWorkerDialog = OpenCantinaWorkerDialog;
