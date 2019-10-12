const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { OpenCantinaWorkerDialog } = require('./openCantinaWorkerDialog');

const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';

const OPEN = 'open';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN_WELCOME_PROMPT = 'welcomePrompt';
// TODO: Should be outsourced to json.
const OPEN_WELCOME_PROMPT_MESSAGE = 'Lass mich herausfinden, welches das' +
    ' richtige Gericht für dich ist. Du kannst mir z.B. sagen "ich würde' +
    ' gerne etwas veganes essen", "bitte ohne erdnüsse", "ich bin' +
    ' allergisch gegen soja" oder "ich vertrage kein sesam". Wenn du fertig' +
    ' bist, sag einfach "fertig".\n\n\n Alles klar?';

// TODO: Why so complicated?
const userChoices = ['Ja'];
const CHOICE = {
    YES: 0
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
                this.runWorker.bind(this)
            ]));
        this.initialDialogId = OPEN;
    }

    async welcomeUser(step) {
        console.log('[OpenCantinaDialog]: welcome user');
        return await step.prompt(OPEN_WELCOME_PROMPT, {
            prompt: MessageFactory.text(OPEN_WELCOME_PROMPT_MESSAGE),
            choices: ChoiceFactory.toChoices(userChoices),
            style: ListStyle.suggestedAction
        });
    }

    async runWorker(step) {
        const choice = step.result.value;
        if (userChoices[CHOICE.YES] === choice) {
            console.log('[OpenCantinaDialog]: start worker...');
            // Setting options to 'start', so the worker knows where the
            // beginning and the middle of the dialog is.
            return await step.replaceDialog(OPEN_CANTINA_WORKER_DIALOG, 'start');
        }
    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
