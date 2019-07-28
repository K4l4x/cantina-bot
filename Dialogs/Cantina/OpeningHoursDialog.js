const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

// Opening hours of mensaX as json to simply be converted to an adaptive card.
// const mensaHours = require('../../resources/MensaX/OpeningHours');

const { Cantina } = require('../../Model/Cantina');
const { CardSchemaCreator } = require('../../Model/CardSchemaCreator');

const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const OPENING_HOURS = 'openingHours';

class OpeningHoursDialog extends ComponentDialog {
    constructor(id) {
        super(id || OPENING_HOURS_DIALOG);

        this.addDialog(new WaterfallDialog(OPENING_HOURS, [
            this.showHours.bind(this)
        ]));

        this.initialDialogId = OPENING_HOURS;
    }

    async showHours(step) {
        const cantina = new Cantina('MensaX', 'someHours');
        const cardSchema = new CardSchemaCreator();
        let openingHours = cardSchema.loadFromJSON(cantina.name, 'OpeningHours');

        if (openingHours === null) {
            openingHours = cardSchema.createOpeningHoursCard(cantina);
            cardSchema.saveAsJSON(cantina.name, 'OpeningHours', openingHours);
        }

        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(openingHours)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
