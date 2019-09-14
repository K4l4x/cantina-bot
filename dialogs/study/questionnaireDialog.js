const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const QUESTIONNAIRE_DIALOG = 'questionnaireDialog';
const QUESTIONNAIRE = 'questionnaire';

class QuestionnaireDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || QUESTIONNAIRE_DIALOG);
        this.addDialog(new WaterfallDialog(QUESTIONNAIRE,
            [
                this.firstTest.bind(this)
            ]));
        this.initialDialogId = QUESTIONNAIRE;
    }

    async firstTest(step) {
        return await step.endDialog();
    }
}

module.exports.QuestionnaireDialog = QuestionnaireDialog;
