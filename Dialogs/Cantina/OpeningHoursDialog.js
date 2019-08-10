const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');
const { Cantina } = require('../../Model/Cantina');
const { CardSchemaCreator } = require('../../Model/CardSchemaCreator');

const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const OPENING_HOURS = 'openingHours';

class OpeningHoursDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || OPENING_HOURS_DIALOG);
        this.addDialog(new WaterfallDialog(OPENING_HOURS, [
            this.showHours.bind(this)
        ]));
        this.initialDialogId = OPENING_HOURS;
    }

    async showHours(step) {
        const cantina = Object.assign(new Cantina(), step.options);
        const cardSchema = new CardSchemaCreator();
        let openingHours = await cardSchema.loadFromJSON(cantina.name, 'OpeningHours');

        if (openingHours === null) {
            openingHours = cardSchema.createOpeningHoursCard(cantina);
            await cardSchema.saveAsJSON(cantina.name, 'OpeningHours', openingHours);
        }

        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(openingHours)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
