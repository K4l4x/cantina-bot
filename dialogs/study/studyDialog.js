const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { GuidedCantinaDialog } = require('./guidedCantinaDialog');
const { OpenCantinaDialog } = require('./openCantinaDialog');

const STUDY_DIALOG = 'studyDialog';
const STUDY = 'study';

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';

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

class StudyDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || STUDY_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new GuidedCantinaDialog(GUIDED_CANTINA_DIALOG));
        this.addDialog(new OpenCantinaDialog(
            OPEN_CANTINA_DIALOG, this.luisRecognizer));
        this.addDialog(new ChoicePrompt(OPEN_WELCOME_PROMPT));
        this.addDialog(new WaterfallDialog(STUDY, [
            this.startStudy.bind(this),
            this.promptNLP.bind(this),
            this.handleNLPChoice.bind(this),
            this.analyseStudyResult.bind(this)
        ]));
        this.initialDialogId = STUDY;
    }

    async startStudy(step) {
        // For testing: set number below 15 for guided, above 15 for open.
        // const randomNum = 11;
        const randomNum = 16;
        // const randomNum = this.getRandomNum(10, 20);

        console.log('[Randomizer Result]: ' + randomNum);
        console.log('Studie starten...');

        if (randomNum < 15) {
            console.log('[StudyDialog]: guided dialog');
            return await step.beginDialog(GUIDED_CANTINA_DIALOG, step.options);
        } else {
            console.log('[StudyDialog]: nlp dialog');
            return await step.next(step.options);
        }
    }

    // TODO: Has to be moved to own Dialog class.
    async promptNLP(step) {
        return await step.prompt(OPEN_WELCOME_PROMPT, {
            prompt: OPEN_WELCOME_PROMPT_MESSAGE,
            choices: ChoiceFactory.toChoices(userChoices),
            retryPrompt: OPEN_WELCOME_RETRY_TEXT,
            style: 1
        });
    }

    // TODO: Has to be moved to own Dialog class.
    async handleNLPChoice(step) {
        const choice = step.result.value;
        if (userChoices[CHOICE.YES] === choice) {
            return await step.beginDialog(OPEN_CANTINA_DIALOG, step.options);
        } else {
            return await step.next(step.options);
        }
    }

    async analyseStudyResult(step) {
        // const result = step.result;
        // return await step.endDialog(result);
        return await step.endDialog();
    }

    getRandomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // TODO: Add possibility to just show todays menu, because algo could be
    //  meh.
}

module.exports.StudyDialog = StudyDialog;
