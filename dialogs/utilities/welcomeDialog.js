const { WaterfallDialog, ChoicePrompt, ChoiceFactory, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DisclaimerDialog } = require('./disclaimerDialog');

const WELCOME_DIALOG = 'welcomeDialog';
const WELCOME = 'welcome';

const WELCOME_PROMPT = 'welcomePrompt';
const WELCOME_MESSAGE = 'Hi, ich bin CantinaBot. \n\n Finde mit meiner Hilfe' +
    ' heraus, welches Gericht heute genau zu dir passt. Oder blättere' +
    ' einfach durch das Menü von heute oder eines anderen Tages der Woche.';
// const welcomeInfo = 'Hi, ich bin CantinaBot. \n Du hast bestimmt Hunger! \n' +
//     ' Sieh dir die fantastische Auswahl an Gerichten für Heute an! \n';
const WELCOME_CHOICE = ['Okay, cool und weiter?'];
const DISCLAIMER_DIALOG = 'disclaimerDialog';

class WelcomeDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || WELCOME_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new ChoicePrompt(WELCOME_PROMPT));
        this.addDialog(new DisclaimerDialog(
            DISCLAIMER_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(WELCOME,
            [
                this.welcomeMessage.bind(this),
                this.prepareDisclaimer.bind(this),
                this.endWelcome.bind(this)
            ]));
        this.initialDialogId = WELCOME;
    }

    async welcomeMessage(step) {
        return await step.prompt(WELCOME_PROMPT, {
            prompt: WELCOME_MESSAGE,
            choices: ChoiceFactory.toChoices(WELCOME_CHOICE),
            style: ListStyle.suggestedAction
        });
    }

    async prepareDisclaimer(step) {
        return await step.beginDialog(DISCLAIMER_DIALOG, step.options);
    }

    async endWelcome(step) {
        return await step.endDialog(step.result);
    }
}

module.exports.WelcomeDialog = WelcomeDialog;
