const { WaterfallDialog } = require('botbuilder-dialogs');
const { MessageFactory } = require('botbuilder');

const { CancelAndHelpDialog } = require('./utilities/cancelAndHelpDialog');

const STUDY_DIALOG = 'studyDialog';
const STUDY = 'study';

class StudyDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || STUDY_DIALOG);
        this.addDialog(new WaterfallDialog(STUDY, [
            this.startStudy.bind(this)
        ]));
        this.initialDialogId = STUDY;
    }

    async startStudy(step) {
        await step.context.sendActivity(MessageFactory.text('Studie' +
            ' starten...'));

        return await step.endDialog();
    }
}

module.exports.StudyDialog = StudyDialog;
