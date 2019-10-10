const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { CardSchema } = require('../../utilities/cardSchema');

const OPENING_HOURS = 'openingHours';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';

class OpeningHoursDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || OPENING_HOURS_DIALOG);
        this.addDialog(new WaterfallDialog(OPENING_HOURS, [
            this.showHours.bind(this)
        ]));
        this.initialDialogId = OPENING_HOURS;
    }

    // TODO: Remove reference to CardSchema and move it to cantina, so we
    //  just need cantina here and get the opening hours in the right format.
    async showHours(step) {
        console.log('[OpeningHoursDialog]: show user opening hours');
        const cantina = step.options;
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
