
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs') 

const initialId = 'profile';

class ProfileDialog extends ComponentDialog {
	/*
	 * 
	 * @param {dialogID} identifies this dialog.
	 */
	constructor(dialogID) {
		super(dialogID);

        // ID of the child dialog that should be started anytime this component is started.
		this.initialDialogId = initialId;

        // Define the conversation flow using a waterfall model.
		this.addDialog(new WaterfallDialog(initialId, 
			[async function (step) {
				await step.context.sendActivity('Hallo, ich ein einfacher MensaBot. Bisher kann ich leider noch nicht viel haha.');

				// End the dialog.
                return await step.endDialog();
			}
		]));
	}
}

exports.ProfileDialog = ProfileDialog