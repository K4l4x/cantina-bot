
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'privacy';

class DisclaimerDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        // Simple disclaimer message to point out privacy policy terms.
        const disclaimerMessage = '';

        // Define the conversation flow using a waterfall model.
        this.addDialog(
            new WaterfallDialog(
                initialId, [
                    async function(step) {
                        await step.context.sendActivity(disclaimerMessage);

                        // End the dialog.
                        return await step.endDialog();
                    }
                ]
            )
        );
    }
}
exports.PrivacyPolicyDialog = PrivacyPolicyDialog;
