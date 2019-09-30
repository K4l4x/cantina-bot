const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { GuidedCantinaDialog } = require('./guidedCantinaDialog');

const STUDY_DIALOG = 'studyDialog';
const STUDY = 'study';

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';

class StudyDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || STUDY_DIALOG);
        this.addDialog(new GuidedCantinaDialog(GUIDED_CANTINA_DIALOG));
        this.addDialog(new WaterfallDialog(STUDY, [
            this.startStudy.bind(this)
        ]));
        this.initialDialogId = STUDY;
    }

    async startStudy(step) {
        // const randomNum = this.getRandomNum(10, 20);
        const randomNum = 11;
        console.log('[Randomizer Result]: ' + randomNum);
        console.log('Studie starten...');
        if (randomNum < 15) {
            console.log('guided dialog');
            return await step.replaceDialog(GUIDED_CANTINA_DIALOG, step.options);
        } else {
            console.log('nlp dialog');
            // return await step.replaceDialog(GUIDED_CANTINA_DIALOG,
            // step.options);
            return await step.endDialog();
        }
    }

    getRandomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports.StudyDialog = StudyDialog;
