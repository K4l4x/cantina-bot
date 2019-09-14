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
        console.log('Studie starten...');
        return await step.replaceDialog(GUIDED_CANTINA_DIALOG, step.options);
    }
}

module.exports.StudyDialog = StudyDialog;
