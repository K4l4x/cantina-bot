const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt, TextPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');

const { Study } = require('../../model/study');
const { JsonOps } = require('../../utilities/jsonOps');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const GUIDED = 'guided';

const userDeclines = 'nein';
const userAccepts = 'ja';
const userChoices = [userAccepts, userDeclines];

const WELCOME_TO_DIALOG = MessageFactory.text('Ich werde dir nun ein paar' +
    ' Fragen stellen und durch deine Antworten das richtige Gericht für' +
    ' dich finden.');

// Start of step tree.
const FIRST_PROMPT_MEET = 'meetPrompt';
const FIRST_PROMPT_MESSAGE_MEET = 'Magst du fleischhaltiges Essen?';

// Have no prefixing number, because they are part of the FIRST_PROMPT. If
// the user declines FIRST_PROMPT this will be the next two prompts.
const VEGETARIAN_PROMPT = 'vegetarianPrompt';
const VEGETARIAN_PROMPT_MESSAGE = 'Bist du Vegetarier?';
const VEGAN_PROMPT = 'veganPrompt';
const VEGAN_PROMPT_MESSAGE = 'Bist du Veganer?';

const SECOND_PROMPT_WITHOUT_SPECIFIC = 'withoutSpecificPrompt';
const SECOND_PROMPT_MESSAGE_WITHOUT_SPECIFIC = 'Alle Arten Fleisch? Oder' +
    ' verzichtest du auf Gewisse? Du kannst sie mir mit Kommata getrennt' +
    ' auflisten z.B. Schwein, Rind,...';

const THIRD_PROMPT_ALLERGIES = 'allergiesPrompt';
const THIRD_PROMPT_MESSAGE_ALLERGIES = 'Ich hoffe du hast keine Allergien!' +
    ' Falls doch, scheib sie mir mit Kommata gerennt auf z.B. Erdnüsse,' +
    ' Dinkel, ... oder A20, A23, ....';

const FORTH_PROMPT_OTHER = 'othersPrompt';
const FORTH_PROMPT_MESSAGE_OTHER = 'Soll ich auf sonstige Ergänzungen' +
    ' achten? Zum Beispiel Süßungsmittel oder Farbstoff.';

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

class GuidedCantinaDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || GUIDED_CANTINA_DIALOG);
        this.addDialog(new ChoicePrompt(FIRST_PROMPT_MEET));
        this.addDialog(new ChoicePrompt(VEGETARIAN_PROMPT));
        this.addDialog(new ChoicePrompt(VEGAN_PROMPT));
        this.addDialog(new TextPrompt(SECOND_PROMPT_WITHOUT_SPECIFIC));
        this.addDialog(new TextPrompt(THIRD_PROMPT_ALLERGIES));
        this.addDialog(new TextPrompt(FORTH_PROMPT_OTHER));
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new WaterfallDialog(GUIDED,
            [
                this.welcomeUser.bind(this),
                this.prepareMeet.bind(this),
                this.meetCheck.bind(this),
                this.vegetarianCheck.bind(this),
                this.veganCheck.bind(this),
                this.checkNotWantedMeets.bind(this),
                this.checkAllergies.bind(this),
                this.checkOther.bind(this),
                this.guidedResult.bind(this)
            ]));
        this.initialDialogId = GUIDED;
    }

    async welcomeUser(step) {
        await step.context.sendActivity(WELCOME_TO_DIALOG);
        return await step.next();
    }

    async prepareMeet(step) {
        return await step.prompt(FIRST_PROMPT_MEET, {
            prompt: FIRST_PROMPT_MESSAGE_MEET,
            choices: ChoiceFactory.toChoices(userChoices)
        });
    }

    async meetCheck(step) {
        const likesMeet = step.result.value;
        if (likesMeet === userAccepts) {
            studySample.likesMeet = true;
            return await step.next();
        }

        return await step.prompt(VEGETARIAN_PROMPT, {
            prompt: VEGETARIAN_PROMPT_MESSAGE,
            choices: ChoiceFactory.toChoices(userChoices)
        });
    }

    async vegetarianCheck(step) {
        if (typeof step.result !== 'undefined') {
            const isVegetarian = step.result.value;
            if (isVegetarian === userAccepts) {
                studySample.isVegetarian = true;
            }

            return await step.prompt(VEGAN_PROMPT, {
                prompt: VEGAN_PROMPT_MESSAGE,
                choices: ChoiceFactory.toChoices(userChoices)
            });
        } else {
            return await step.next();
        }
    }

    async veganCheck(step) {
        if (typeof step.result !== 'undefined') {
            const isVegan = step.result.value;
            if (isVegan === userAccepts) {
                studySample.isVegan = true;
            }
            return await step.next();
        } else {
            return await step.prompt(SECOND_PROMPT_WITHOUT_SPECIFIC, {
                prompt: SECOND_PROMPT_MESSAGE_WITHOUT_SPECIFIC
            });
        }
    }

    // Only hit, if user is not vegetarian or vegan.
    async checkNotWantedMeets(step) {
        if (typeof step.result !== 'undefined') {
            const result = step.result;
            studySample.notWantedMeets = result.split(',');
        }
        return await step.prompt(THIRD_PROMPT_ALLERGIES, {
            prompt: THIRD_PROMPT_MESSAGE_ALLERGIES
        });
    }

    async checkAllergies(step) {
        if (typeof step.result !== 'undefined') {
            const result = step.result;
            studySample.allergies = result.split(',');
        }
        return await step.prompt(FORTH_PROMPT_OTHER, {
            prompt: FORTH_PROMPT_MESSAGE_OTHER
        });
    }

    async checkOther(step) {
        if (typeof step.result !== 'undefined') {
            const result = step.result;
            studySample.other = result.split(',');
        }
        return await step.next();
    }

    async guidedResult(step) {
        // await step.context.sendActivity(MessageFactory
        //     .text(JSON.stringify(studySample)));

        // TODO Go back to studyDialog with result.
        await step.context.sendActivity(THANK_USER);
        return await step.replaceDialog(MATCHING_DISH_DIALOG, studySample);
    }
}

module.exports.GuidedCantinaDialog = GuidedCantinaDialog;
