const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { OpenCantinaWorkerDialog } = require('./openCantinaWorkerDialog');

const { Study } = require('../../model/study');

const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN = 'open';

const OPEN_WELCOME_PROMPT = 'welcomePrompt';
const OPEN_WELCOME_PROMPT_MESSAGE = MessageFactory.text('Ich versuche nun aus' +
    ' deinen Angaben heraus zu erfahren, welches das richtige Gericht für' +
    ' dich ist. Du kannst mir z.B. sagen "ich würge gerne etwas veganes' +
    ' essen", "bitte ohne erdnüsse", "ich bin allergisch gegen soja" oder' +
    ' "ich vertrage kein sesam". Wenn du fertig bist, sag einfach "fertig".\n' +
    ' Alles klar?');

const OPEN_WELCOME_RETRY_TEXT = MessageFactory.text('Das steht leider nicht' +
    ' zur Auswahl. Ein ganz einfaches "Ja" oder "Nein" reicht.');

const userChoices = ['Ja'];

const CHOICE = {
    YES: 0
};

const studySample = {
    likesMeet: false,
    isVegetarian: false,
    isVegan: false,
    notWantedMeets: [],
    allergies: [],
    other: [],
    cantina: {}
};

class OpenCantinaDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || OPEN_CANTINA_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new OpenCantinaWorkerDialog(OPEN_CANTINA_WORKER_DIALOG,
            this.luisRecognizer));
        this.addDialog(new ChoicePrompt(OPEN_WELCOME_PROMPT));
        this.addDialog(new WaterfallDialog(OPEN,
            [
                this.welcomeUser.bind(this),
                this.runOpenWorker.bind(this)
            ]));
        this.initialDialogId = OPEN;
    }

    async welcomeUser(step) {
        return await step.prompt(OPEN_WELCOME_PROMPT, {
            prompt: OPEN_WELCOME_PROMPT_MESSAGE,
            choices: ChoiceFactory.toChoices(userChoices),
            retryPrompt: OPEN_WELCOME_RETRY_TEXT,
            style: 1
        });
    }

    async runOpenWorker(step) {
        const choice = step.result.value;
        if (userChoices[CHOICE.YES] === choice) {
            return await step.replaceDialog(OPEN_CANTINA_WORKER_DIALOG, step.options);
        }
    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
