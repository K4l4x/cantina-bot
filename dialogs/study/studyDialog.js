const { MessageFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { GuidedCantinaDialog } = require('./guidedCantinaDialog');
const { OpenCantinaDialog } = require('./openCantinaDialog');

const STUDY_DIALOG = 'studyDialog';
const STUDY = 'study';

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const OPEN_CANTINA_DIALOG = 'openCantinaDialog';

class StudyDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || STUDY_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new GuidedCantinaDialog(GUIDED_CANTINA_DIALOG));
        this.addDialog(new OpenCantinaDialog(
            OPEN_CANTINA_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(STUDY, [
            this.startStudy.bind(this),
            this.analyseStudyResult.bind(this)
        ]));
        this.initialDialogId = STUDY;
    }

    async startStudy(step) {
        // For testing: set number below 15 for guided, above 15 for open.
        const randomNum = 11;
        // const randomNum = 16;
        // const randomNum = this.getRandomNum(10, 20);

        console.log('[Randomizer Result]: ' + randomNum);
        console.log('Studie starten...');

        if (randomNum < 15) {
            console.log('[StudyDialog]: guided dialog');
            return await step.beginDialog(GUIDED_CANTINA_DIALOG, step.options);
        } else {
            console.log('[StudyDialog]: nlp dialog');
            return await step.beginDialog(OPEN_CANTINA_DIALOG, step.options);
        }
    }

    async analyseStudyResult(step) {
        const result = step.result;
        return await step.endDialog(result);
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
