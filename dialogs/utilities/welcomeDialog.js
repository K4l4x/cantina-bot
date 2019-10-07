const { WaterfallDialog, ChoicePrompt, ChoiceFactory, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DisclaimerDialog } = require('./disclaimerDialog');
const { StudyDialog } = require('../study/studyDialog');

const WELCOME_DIALOG = 'welcomeDialog';
const WELCOME = 'welcome';

const WELCOME_PROMPT = 'welcomePrompt';
const WELCOME_MESSAGE = 'Hi, ich bin CantinaBot. \n\n Finde mit meiner Hilfe' +
    ' heraus, welches Gericht heute genau zu dir passt. Oder blättere' +
    ' einfach durch das Menü von heute oder eines anderen Tages der Woche.';
// const welcomeInfo = 'Hi, ich bin CantinaBot. \n Du hast bestimmt Hunger! \n' +
//     ' Sieh dir die fantastische Auswahl an Gerichten für Heute an! \n';
const WELCOME_CHOICE = ['ich bin veganer'];

const DISCLAIMER_DIALOG = 'disclaimerDialog';
const STUDY_DIALOG = 'studyDialog';

class WelcomeDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || WELCOME_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new ChoicePrompt(WELCOME_PROMPT));
        this.addDialog(new StudyDialog(STUDY_DIALOG, this.luisRecognizer));
        this.addDialog(new DisclaimerDialog(
            DISCLAIMER_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(WELCOME,
            [
                this.welcomeMessage.bind(this),
                this.prepareDisclaimer.bind(this)
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
        return await step.replaceDialog(STUDY_DIALOG, step.options);
    }
}

module.exports.WelcomeDialog = WelcomeDialog;
