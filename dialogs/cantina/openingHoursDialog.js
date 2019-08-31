const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { Cantina } = require('../../model/cantina');
const { CardSchemaCreator } = require('../../model/cardSchemaCreator');

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
        let openingHours = await cardSchema.loadFromJSON(cantina.name,
            'openingHours');

        if (openingHours === null) {
            openingHours = cardSchema.createOpeningHoursCard(cantina);
            await cardSchema.saveAsJSON(cantina.name, 'openingHours',
                openingHours);
        }

        await step.context.sendActivity({
            attachments: [
                CardFactory.adaptiveCard(openingHours)
            ],
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
