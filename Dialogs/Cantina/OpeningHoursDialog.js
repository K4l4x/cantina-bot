const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

// Opening hours of mensaX as json to simply be converted to an adaptive card.
const mensaHours = require('../../resources/MensaX/OpeningHours');

const OPENING_HOURS = 'openingHours';

class OpeningHoursDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'openingHoursDialog');

        this.addDialog(new WaterfallDialog(OPENING_HOURS, [
            this.showHours.bind(this)
        ]));

        this.initialDialogId = OPENING_HOURS;
    }

    async showHours(step) {
        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(mensaHours)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
