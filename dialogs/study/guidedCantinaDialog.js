// Framework imports.
const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ComponentDialog, ChoiceFactory, ChoicePrompt, TextPrompt, ListStyle } = require('botbuilder-dialogs');

// Dialog Imports.
const { MatchingDishDialog } = require('./matchingDishDialog');
// Model imports.
const { Study } = require('../../model/study');
// Import cached knowlegde about meetParts.
const MeetParts = require('../../resources/utilities/meetParts');

// Setting id's for all needed dialogs.
const MATCHING_DISH_DIALOG = 'matchingDishDialog';

// Setting id's for this dialog.
const GUIDED = 'guided';
const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';

// ----------------------------------------------------
// Dialog prompts and fellow messages.
const WELCOME_GUIDED_CHOICEPROMPT = 'welcomeGuidedPrompt';
const WELCOME_GUIDED_PROMPT_TEXT = 'Ich werde dir nun ein' +
    ' paar Fragen stellen und versuchen durch deine Antworten das richtige' +
    ' Gericht für dich zu finden. Falls du das ganze abbrechen möchtest,' +
    ' schreib mir' +
    ' einfach **"stopp"** oder **"abbrechen"**. Falls du es später gerne' +
    ' noch einmal probieren möchtest, findest du mit **Finde mein' +
    ' Gericht** wieder hier hin.\n\n' +
    'Alles klar?';

// Start of step tree.
const FIRST_CHOICEPROMPT_MEET = 'meetPrompt';
const FIRST_PROMPT_MESSAGE_MEET = 'Magst du fleischhaltiges Essen?';

// Have no prefixing number, because they are part of the FIRST_PROMPT. If
// the user declines FIRST_PROMPT this will be the next two prompts.
const VEGETARIAN_CHOICEPROMPT = 'vegetarianPrompt';
const VEGETARIAN_PROMPT_MESSAGE = 'Möchtest du vegetarische Gerichte?';
const VEGAN_CHOICEPROMPT = 'veganPrompt';
const VEGAN_PROMPT_MESSAGE = 'Möchtest du vegane Gerichte?';

const SECOND_TEXTPROMPT_WITHOUT_MEETS = 'withoutMeetsPrompt';
const SECOND_PROMPT_MESSAGE_WITHOUT_MEETS = 'Magst du alle Sorten Fleisch?' +
    ' Verzichtest du vielleicht auf gewisse Sorten? Du kannst sie mir mit' +
    ' Kommata getrennt auflisten z.B. Schwein, Rind,... oder mit **"Nein"**' +
    ' antworten.';

const THIRD_TEXTPROMPT_ALLERGIES = 'allergiesPrompt';
const THIRD_PROMPT_MESSAGE_ALLERGIES = 'Ich hoffe du hast keine Allergien!' +
    ' Falls doch, scheib sie mir mit Kommata gerennt auf z.B. Erdnüsse,' +
    ' Dinkel, ... oder A20, A23, ... oder mit **"Nein"**' +
    ' antworten.';

const FORTH_TEXTPROMPT_SUPPLEMENTS = 'supplementsPrompt';
const FORTH_PROMPT_MESSAGE_SUPPLEMENTS = 'Soll ich auf sonstige Ergänzungen' +
    ' achten? Zum Beispiel Süßungsmittel oder Farbstoff. Falls nicht,' +
    ' antworte einfach mit **"Nein"**.';

// End of strep tree.
const THANK_USER = 'Das war\'s schon, vielen Dank! ' +
    'Lass mich kurz nach dem passenden Gericht suchen...';
// End of dialog basically.
// ----------------------------------------------------

const START_GUIDED_DIALOG = ['Leg los!'];
const USER_ACCEPTS = 'Ja';
const USER_DECLINES = 'Nein';
const USER_CHOICES = [USER_ACCEPTS, USER_DECLINES];

/**
 *
 */
class GuidedCantinaDialog extends ComponentDialog {
    constructor(id) {
        super(id || GUIDED_CANTINA_DIALOG);
        this.addDialog(new ChoicePrompt(FIRST_CHOICEPROMPT_MEET));
        this.addDialog(new ChoicePrompt(VEGETARIAN_CHOICEPROMPT));
        this.addDialog(new ChoicePrompt(VEGAN_CHOICEPROMPT));
        this.addDialog(new ChoicePrompt(WELCOME_GUIDED_CHOICEPROMPT));
        this.addDialog(new TextPrompt(SECOND_TEXTPROMPT_WITHOUT_MEETS));
        this.addDialog(new TextPrompt(THIRD_TEXTPROMPT_ALLERGIES));
        this.addDialog(new TextPrompt(FORTH_TEXTPROMPT_SUPPLEMENTS));
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

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async welcomeUser(step) {
        return await step.prompt(WELCOME_GUIDED_CHOICEPROMPT, {
            prompt: MessageFactory.text(WELCOME_GUIDED_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(START_GUIDED_DIALOG),
            style: ListStyle.suggestedAction
        });
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async handleWelcomeReply(step) {
        const choice = step.result.value;
        if (START_GUIDED_DIALOG[0] === choice) {
            step.values.study = new Study();
            return await step.next();
        }
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async prepareMeetPrompt(step) {
        return await step.prompt(FIRST_CHOICEPROMPT_MEET, {
            prompt: MessageFactory.text(FIRST_PROMPT_MESSAGE_MEET),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkLikesMeet(step) {
        const likesMeet = step.result.value;
        if (likesMeet === USER_ACCEPTS) {
            step.values.study.likesMeet = true;
            return await step.next();
        }
        return await step.prompt(VEGETARIAN_CHOICEPROMPT, {
            prompt: MessageFactory.text(VEGETARIAN_PROMPT_MESSAGE),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkVegetarian(step) {
        if (typeof step.result !== 'undefined') {
            const isVegetarian = step.result.value;
            if (isVegetarian === USER_ACCEPTS) {
                step.values.study.isVegetarian = true;
            }
            return await step.prompt(VEGAN_CHOICEPROMPT, {
                prompt: MessageFactory.text(VEGAN_PROMPT_MESSAGE),
                choices: ChoiceFactory.toChoices(USER_CHOICES),
                style: ListStyle.suggestedAction
            });
        } else {
            return await step.next();
        }
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkVegan(step) {
        if (typeof step.result !== 'undefined') {
            const isVegan = step.result.value;
            if (isVegan === USER_ACCEPTS) {
                step.values.study.isVegan = true;
            }
            return await step.next();
        } else {
            return await step.prompt(SECOND_TEXTPROMPT_WITHOUT_MEETS, {
                prompt: ChoiceFactory.forChannel(
                    step.context,
                    [USER_DECLINES],
                    SECOND_PROMPT_MESSAGE_WITHOUT_MEETS),
                style: ListStyle.suggestedAction
            });
        }
    }

    // TODO: Completely hacked. Should be moved or transformed (validator e.x.).
    // Only hit, if user is not vegetarian or vegan.
    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkNotWantedMeets(step) {
        if (typeof step.result !== 'undefined' &&
            step.result !== USER_DECLINES) {
            const result = step.result;
            step.values.study.notWantedMeets = result.split(',');
            let meets = step.values.study.notWantedMeets;
            for (let meet of step.values.study.notWantedMeets) {
                meet = meet.toLowerCase();
                if (MeetParts.main.includes(meet)) {
                    switch (meet) {
                    case 'rind':
                        meets = meets.concat(MeetParts.beef);
                        break;
                    case 'schwein':
                        meets = meets.concat(MeetParts.pork);
                        break;
                    case 'fisch':
                        meets = meets.concat(MeetParts.fish);
                        break;
                    case 'geflügel':
                        meets = meets.concat(MeetParts.poultry);
                        break;
                    }
                }
            }
            step.values.study.notWantedMeets = meets;
        }
        return await step.prompt(THIRD_TEXTPROMPT_ALLERGIES, {
            prompt: ChoiceFactory.forChannel(
                step.context,
                [USER_DECLINES],
                THIRD_PROMPT_MESSAGE_ALLERGIES),
            style: ListStyle.suggestedAction
        });
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkAllergies(step) {
        if (typeof step.result !== 'undefined' &&
            step.result !== USER_DECLINES) {
            const result = step.result;
            step.values.study.allergies = result.split(',');
        }
        return await step.prompt(FORTH_TEXTPROMPT_SUPPLEMENTS, {
            prompt: ChoiceFactory.forChannel(
                step.context,
                [USER_DECLINES],
                FORTH_PROMPT_MESSAGE_SUPPLEMENTS),
            style: ListStyle.suggestedAction
        });
    }

    /**
     *
     * @param step
     * @returns {Promise<*>}
     */
    async checkSupplements(step) {
        if (typeof step.result !== 'undefined' &&
            step.result !== USER_DECLINES) {
            const result = step.result;
            step.values.study.supplements = result.split(',');
        }
        return await step.next();
    }

    /**
     *
     * @param step
     * @returns {Promise<DialogTurnResult<any>>}
     */
    async guidedResult(step) {
        const study = step.values.study;
        await step.context.sendActivity(MessageFactory.text(THANK_USER));
        return await step.replaceDialog(MATCHING_DISH_DIALOG, study);
    }
}

module.exports.GuidedCantinaDialog = GuidedCantinaDialog;
