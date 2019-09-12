const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const { MessageFactory } = require('botbuilder');

const { CancelAndHelpDialog } = require('./utilities/cancelAndHelpDialog.js');

const { StudyDialog } = require('../dialogs/studyDialog');
const { Study } = require('../model/study');

const DISCLAIMER_DIALOG = 'disclaimerDialog';
const DISCLAIMER_PROMPT = 'disclaimerPrompt';
const DISCLAIMER_PROMPT_TEXT = 'Das ist ein Disclaimer...';
const DISCLAIMER_RETRY_TEXT = '';
const DISCLAIMER = 'disclaimer';
const disclaimerChoices = ['Nein', 'Ja'];

const STUDY_DIALOG = 'studyDialog';

const CHOICE = {
    YES: 1,
    NO: 0
};

class DisclaimerDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || DISCLAIMER_DIALOG);
        this.addDialog(new ChoicePrompt(DISCLAIMER_PROMPT));
        this.addDialog(new StudyDialog(STUDY_DIALOG));
        this.addDialog(new WaterfallDialog(DISCLAIMER,
            [
                this.promptDisclaimer.bind(this),
                this.getUserAnswer.bind(this)
            ]));
        this.initialDialogId = DISCLAIMER;
    }

    async promptDisclaimer(step) {
        return await step.prompt(DISCLAIMER_PROMPT, {
            prompt: DISCLAIMER_PROMPT_TEXT,
            choices: ChoiceFactory.toChoices(disclaimerChoices),
            retryPrompt: DISCLAIMER_RETRY_TEXT,
            style: 1
        });
    }

    async getUserAnswer(step) {
        const choice = step.result.value;

        if (disclaimerChoices[CHOICE.YES] === choice) {
            const study = Object.assign(new Study(), step.options);
            study.disclaimer = 'disclaimer text';

            await step.context.sendActivity(MessageFactory.text(study.disclaimer));
            return await step.replaceDialog(STUDY_DIALOG, study);
        } else {
            await step.context.sendActivity(MessageFactory.text('nein'));
            return await step.endDialog();
        }
    }
}
module.exports.DisclaimerDialog = DisclaimerDialog;
