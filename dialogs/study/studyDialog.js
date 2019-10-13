const { MessageFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { GuidedCantinaDialog } = require('./guidedCantinaDialog');
const { OpenCantinaDialog } = require('./openCantinaDialog');

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';

const STUDY = 'study';
const STUDY_DIALOG = 'studyDialog';

const MIN = 10;
const THRESHOLD = 15;
const MAX = 20;

const FAILED_FINDING_DISH_TEXT = 'Falls dir keines dieser Gerichte' +
    ' zusagt, kannst du mit **"Was gibt es heute zu essen?"** alle Gerichte des' +
    ' heutigen Tages selbst noch einmal anschauen.\n\n' +
    'Sonst schreibe mir **"Ich habe hunger"** und ich werde mit deinen hier' +
    ' gesetzten Preferenzen nach einem Gericht für dich suchen.';

class StudyDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || STUDY_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new GuidedCantinaDialog(GUIDED_CANTINA_DIALOG));
        this.addDialog(new OpenCantinaDialog(
            OPEN_CANTINA_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(STUDY, [
            this.begin.bind(this),
            this.restoreResult.bind(this)
        ]));
        this.initialDialogId = STUDY;
    }

    async begin(step) {
        console.log('[StudyDialog]: begin study...');
        const randomNum = await this.getRandomNum(MIN, MAX);
        console.log('[StudyDialog]: Randomizer Result => ' + randomNum);

        if (randomNum < THRESHOLD) {
            console.log('[StudyDialog]: run guidedDialog');
            return await step.beginDialog(GUIDED_CANTINA_DIALOG);
        } else {
            console.log('[StudyDialog]: run openDialog');
            return await step.beginDialog(OPEN_CANTINA_DIALOG);
        }
    }

    async restoreResult(step) {
        console.log('[StudyDialog]: end study');
        const result = step.result;
        await step.context.sendActivity(MessageFactory
            .text(FAILED_FINDING_DISH_TEXT));
        return await step.endDialog(result);
    }

    async getRandomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        // For testing: return a number below 15 for guided, above 15 for open.
        // return Math.floor(Math.random() * (max - min)) + min;
        return 11;
        // return 16;
    }
}

module.exports.StudyDialog = StudyDialog;
