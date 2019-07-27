const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

// Sample opening hours
const mensaHours = require('../../resources/MensaX/OpeningHours');

const initialId = 'openingHours';

class OpeningHoursDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        this.addDialog(new WaterfallDialog(initialId, [
            this.showHours.bind(this)
        ]));
    }

    async showHours(step) {
        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(mensaHours)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
