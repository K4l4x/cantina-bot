const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt, TextPrompt, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { MatchingDishDialog } = require('./matchingDishDialog');
const { Study } = require('../../model/study');
const { JsonOps } = require('../../utilities/jsonOps');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';

const GUIDED = 'guided';
const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';

// ----------------------------------------------------
// Dialog prompts and fellow messages.
const WELCOME_GUIDED_PROMPT = 'welcomeGuidedPrompt';
const WELCOME_GUIDED_PROMPT_TEXT = 'Ich werde dir nun ein' +
    ' paar Fragen stellen und versuchen durch deine Antworten das richtige' +
    ' Gericht für dich finden. Falls du das ganze abbrechen möchtest, schreib mir' +
    ' einfach **"stopp"** oder **"abbrechen"**. Falls du es später gerne' +
    ' noch einmal probieren möchtest, findest du mit **Finde mein' +
    ' Gericht** wieder hier hin.\n\n' +
    'Alles klar?';

// Start of step tree.
const FIRST_PROMPT_MEET = 'meetPrompt';
const FIRST_PROMPT_MESSAGE_MEET = 'Magst du fleischhaltiges Essen?';

// Have no prefixing number, because they are part of the FIRST_PROMPT. If
// the user declines FIRST_PROMPT this will be the next two prompts.
const VEGETARIAN_PROMPT = 'vegetarianPrompt';
const VEGETARIAN_PROMPT_MESSAGE = 'Möchtest du ein vegetarisches Gericht?';
const VEGAN_PROMPT = 'veganPrompt';
const VEGAN_PROMPT_MESSAGE = 'Möchtest du ein veganes Gericht?';

const SECOND_PROMPT_WITHOUT_SPECIFIC = 'withoutSpecificPrompt';
const SECOND_PROMPT_MESSAGE_WITHOUT_SPECIFIC = 'Magst du alle Sorten Fleisch?' +
    ' Verzichtest du vielleicht auf gewisse Sorten? Du kannst sie mir mit' +
    ' Kommata getrennt auflisten z.B. Schwein, Rind,...';

const THIRD_PROMPT_ALLERGIES = 'allergiesPrompt';
const THIRD_PROMPT_MESSAGE_ALLERGIES = 'Ich hoffe du hast keine Allergien!' +
    ' Falls doch, scheib sie mir mit Kommata gerennt auf z.B. Erdnüsse,' +
    ' Dinkel, ... oder A20, A23, ....';

const FORTH_PROMPT_OTHER = 'othersPrompt';
const FORTH_PROMPT_MESSAGE_OTHER = 'Soll ich auf sonstige Ergänzungen' +
    ' achten? Zum Beispiel Süßungsmittel oder Farbstoff.';

// End of strep tree.
const THANK_USER = 'Das war\'s schon, vielen Dank! ' +
    'Lass mich kurz nach dem passenden Gericht suchen...';
// End of dialog basically.
// ----------------------------------------------------

const START_GUIDED_DIALOG = ['Leg los!'];
const USER_ACCEPTS = 'Ja';
const USER_CHOICES = [USER_ACCEPTS, 'Nein'];

class GuidedCantinaDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || GUIDED_CANTINA_DIALOG);
        this.addDialog(new ChoicePrompt(FIRST_PROMPT_MEET));
        this.addDialog(new ChoicePrompt(VEGETARIAN_PROMPT));
        this.addDialog(new ChoicePrompt(VEGAN_PROMPT));
        this.addDialog(new ChoicePrompt(WELCOME_GUIDED_PROMPT));
        this.addDialog(new TextPrompt(SECOND_PROMPT_WITHOUT_SPECIFIC));
        this.addDialog(new TextPrompt(THIRD_PROMPT_ALLERGIES));
        this.addDialog(new TextPrompt(FORTH_PROMPT_OTHER));
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new WaterfallDialog(GUIDED,
            [
                this.welcomeUser.bind(this),
                this.handleWelcomeReply.bind(this),
                this.prepareMeetPrompt.bind(this),
                this.checkLikesMeet.bind(this),
                this.checkVegetarian.bind(this),
                this.checkVegan.bind(this),
                this.checkNotWantedMeets.bind(this),
                this.checkAllergies.bind(this),
                this.checkSupplements.bind(this),
                this.guidedResult.bind(this)
            ]));
        this.initialDialogId = GUIDED;
    }

    async welcomeUser(step) {
        return await step.prompt(WELCOME_GUIDED_PROMPT, {
            prompt: MessageFactory.text(WELCOME_GUIDED_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(START_GUIDED_DIALOG),
            style: ListStyle.suggestedAction
        });
    }

    async handleWelcomeReply(step) {
        const choice = step.result.value;
        if (START_GUIDED_DIALOG[0] === choice) {
            step.values.study = new Study();
            return await step.next();
        }
    }

    async prepareMeetPrompt(step) {
        return await step.prompt(FIRST_PROMPT_MEET, {
            prompt: MessageFactory.text(FIRST_PROMPT_MESSAGE_MEET),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    async checkLikesMeet(step) {
        const likesMeet = step.result.value;
        if (likesMeet === USER_ACCEPTS) {
            step.values.study.likesMeet = true;
            return await step.next();
        }
        return await step.prompt(VEGETARIAN_PROMPT, {
            prompt: MessageFactory.text(VEGETARIAN_PROMPT_MESSAGE),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    async checkVegetarian(step) {
        if (typeof step.result !== 'undefined') {
            const isVegetarian = step.result.value;
            if (isVegetarian === USER_ACCEPTS) {
                step.values.study.isVegetarian = true;
            }
            return await step.prompt(VEGAN_PROMPT, {
                prompt: MessageFactory.text(VEGAN_PROMPT_MESSAGE),
                choices: ChoiceFactory.toChoices(USER_CHOICES),
                style: ListStyle.suggestedAction
            });
        } else {
            return await step.next();
        }
    }

    async checkVegan(step) {
        if (typeof step.result !== 'undefined') {
            const isVegan = step.result.value;
            if (isVegan === USER_ACCEPTS) {
                step.values.study.isVegan = true;
            }
            return await step.next();
        } else {
            return await step.prompt(SECOND_PROMPT_WITHOUT_SPECIFIC, {
                prompt: MessageFactory
                    .text(SECOND_PROMPT_MESSAGE_WITHOUT_SPECIFIC)
            });
        }
    }

    // Only hit, if user is not vegetarian or vegan.
    async checkNotWantedMeets(step) {
        // TODO: Should be done only once.
        const meetParts = await JsonOps.prototype
            .loadFrom('utilities', 'meetParts');

        if (typeof step.result !== 'undefined') {
            const result = step.result;
            step.values.study.notWantedMeets = result.split(',');
            let meets = step.values.study.notWantedMeets;
            for (let meet of step.values.study.notWantedMeets) {
                meet = meet.toLowerCase();
                if (meetParts.main.includes(meet)) {
                    switch (meet) {
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
            step.values.study.notWantedMeets = meets;
        }
        return await step.prompt(THIRD_PROMPT_ALLERGIES, {
            prompt: MessageFactory.text(THIRD_PROMPT_MESSAGE_ALLERGIES)
        });
    }

    async checkAllergies(step) {
        if (typeof step.result !== 'undefined') {
            const result = step.result;
            step.values.study.allergies = result.split(',');
        }
        return await step.prompt(FORTH_PROMPT_OTHER, {
            prompt: MessageFactory.text(FORTH_PROMPT_MESSAGE_OTHER)
        });
    }

    async checkSupplements(step) {
        if (typeof step.result !== 'undefined') {
            const result = step.result;
            step.values.study.supplements = result.split(',');
        }
        return await step.next();
    }

    async guidedResult(step) {
        const study = step.values.study;
        await step.context.sendActivity(MessageFactory.text(THANK_USER));
        return await step.replaceDialog(MATCHING_DISH_DIALOG, study);
    }
}

module.exports.GuidedCantinaDialog = GuidedCantinaDialog;
