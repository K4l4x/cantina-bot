const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

// Sample opening hours
const mensaHours = require('../resources/MensaX/OpeningHours');
const cafeteriaHours = require('../resources/CafeteriaX/OpeningHours');
const westendHours = require('../resources/Westend/OpeningHours');

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
            CardFactory.adaptiveCard(mensaHours),
            CardFactory.adaptiveCard(cafeteriaHours),
            CardFactory.adaptiveCard(westendHours)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }
}

exports.OpeningHoursDialog = OpeningHoursDialog;
