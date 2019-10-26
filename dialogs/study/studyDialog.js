// Framework imports.
const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

// Dialog Imports.
const { GuidedCantinaDialog } = require('./guidedCantinaDialog');
const { OpenCantinaDialog } = require('./openCantinaDialog');

// Setting id's for all needed dialogs.
const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';

// Setting id's for this dialog.
const STUDY = 'study';
const STUDY_DIALOG = 'studyDialog';

const FAILED_FINDING_DISH_TEXT = 'Falls dir keines dieser Gerichte' +
    ' zusagt, kannst du mit **"Was gibt es heute zu essen?"** alle Gerichte des' +
    ' heutigen Tages selbst noch einmal anschauen.\n\n' +
    'Sonst schreibe mir **"Ich habe hunger"** und ich werde mit deinen hier' +
    ' gesetzten Präferenzen nach einem Gericht für dich suchen.';

/**
 * This selectionDialog is basically not a dialog and just kicks of a
 * randomizer to let the bot choose a dialog randomly. After that dialog is
 * run, return the results back to the rootDialog.
 */
class StudyDialog extends ComponentDialog {
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

    /**
     * Start randomizer and choose the right dialog with the result of the
     * randomizer.
     * @param step
     * @returns {Promise<*>}
     */
    async begin(step) {
        // Setting up boundaries.
        const MIN = 10;
        const THRESHOLD = 15;
        const MAX = 20;

        // Start randomizer.
        console.log('[StudyDialog]: begin study...');
        const randomNum = await this.getRandomNum(MIN, MAX);
        console.log('[StudyDialog]: Randomizer Result => ' + randomNum);

        // Check randomizer result.
        if (randomNum < THRESHOLD) {
            console.log('[StudyDialog]: run guidedDialog');
            return await step.beginDialog(GUIDED_CANTINA_DIALOG);
        } else {
            console.log('[StudyDialog]: run openDialog');
            return await step.beginDialog(OPEN_CANTINA_DIALOG);
        }
    }

    /**
     * After one of the choosen dialogs has run, return it's result back to
     * the root dialog. Also inform the user about his options.
     * @param step
     * @returns {Promise<DialogTurnResult<any>|void>}
     */
    async restoreResult(step) {
        console.log('[StudyDialog]: end study');
        const result = step.result;
        await step.context.sendActivity(MessageFactory
            .text(FAILED_FINDING_DISH_TEXT));
        return await step.endDialog(result);
    }

    /**
     * Simple randomizer to return a number to check against a fixed threshold.
     * @param min boundary.
     * @param max boundary.
     * @returns {Promise<number>}
     */
    async getRandomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        // For testing: return a number below 15 for guided, above 15 for open.
        // return Math.floor(Math.random() * (max - min)) + min;
        // return 11;
        return 16;
    }
}

module.exports.StudyDialog = StudyDialog;
