const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { Cantina } = require('../../model/cantina');
const { CardSchema } = require('../../utilities/cardSchema');

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
        const cantina = new Cantina();
        Object.assign(cantina, step.options);

        await step.context.sendActivity({
            attachments: [CardFactory
                .adaptiveCard(await CardSchema.prototype
                    .createOpeningHoursCard(cantina))
            ],
            attachmentLayout: AttachmentLayoutTypes.List
        });

        return await step.endDialog();
    }
}

module.exports.OpeningHoursDialog = OpeningHoursDialog;
