const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DisclaimerDialog } = require('./disclaimerDialog');

const DISCLAIMER_DIALOG = 'disclaimerDialog';

const WELCOME = 'welcome';
const WELCOME_DIALOG = 'welcomeDialog';
const WELCOME_PROMPT = 'welcomePrompt';
const WELCOME_MESSAGE = 'Hi, ich bin CantinaBot.\n\n' +
    'Finde mit meiner Hilfe heraus, welches Gericht heute genau zu dir' +
    ' passt. Oder blättere einfach durch das Menü von heute oder eines' +
    ' anderen Tages der Woche. Mit dem Stichwort **"stopp"**"" kannst du' +
    ' mich jederzeit unterbrechen und mit **"hife"** zeige ich dir, was du' +
    ' mich generell Fragen kannst.';

const WELCOME_CHOICE = ['Okay, cool und weiter?'];

class WelcomeDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || WELCOME_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new ChoicePrompt(WELCOME_PROMPT));
        this.addDialog(new DisclaimerDialog(
            DISCLAIMER_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(WELCOME,
            [
                this.welcomeUser.bind(this),
                this.prepareDisclaimer.bind(this)
            ]));
        this.initialDialogId = WELCOME;
    }

    async welcomeUser(step) {
        console.log('[WelcomeDialog]: prompt user with welcome');
        return await step.prompt(WELCOME_PROMPT, {
            prompt: MessageFactory.text(WELCOME_MESSAGE),
            choices: ChoiceFactory.toChoices(WELCOME_CHOICE),
            style: ListStyle.suggestedAction
        });
    }

    async prepareDisclaimer(step) {
        console.log('[WelcomeDialog]: replace with disclaimerDialog to keep' +
            ' stack small');
        return await step.replaceDialog(DISCLAIMER_DIALOG);
    }
}

module.exports.WelcomeDialog = WelcomeDialog;
