const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { OpenCantinaWorkerDialog } = require('./openCantinaWorkerDialog');
const { Study } = require('../../model/study');

const OPEN_CANTINA_WORKER_DIALOG = 'openCantinaWorkerDialog';

const OPEN = 'open';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN_WELCOME_PROMPT = 'welcomePrompt';

const OPEN_WELCOME_PROMPT_MESSAGE = 'Lass mich herausfinden, welches das' +
    ' richtige Gericht für dich ist. Du kannst mir z.B. sagen **"ich würde' +
    ' gerne etwas veganes essen"**, **"Ich verzichte auf Schwein"**, **"ich' +
    ' bin allergisch gegen soja"** oder **"ich vertrage kein' +
    ' sesam"**. Wenn du fertig bist, sag einfach **"fertig"**.\n\n' +
    'Alles klar?';

const USER_ACCEPTS = 'Ja';
const USER_CHOICES = [USER_ACCEPTS];

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
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    async runWorker(step) {
        const choice = step.result.value;
        const study = new Study();
        study.ankerPrompt = 'Okay, leg los';
        if (USER_ACCEPTS === choice) {
            console.log('[OpenCantinaDialog]: start worker...');

            return await step.replaceDialog(OPEN_CANTINA_WORKER_DIALOG, study);
        }
    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
