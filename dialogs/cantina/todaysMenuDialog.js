const { MessageFactory, CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { Cantina } = require('../../model/cantina');
const { CardSchema } = require('../../utilities/cardSchema');
const { Dish } = require('../../model/dish');

const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const TODAYS_MENU = 'todaysMenu';

class TodaysMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || TODAYS_MENU_DIALOG);
        this.addDialog(new WaterfallDialog(TODAYS_MENU, [
            this.scrollTroughMenus.bind(this)
        ]));
        this.initialDialogId = TODAYS_MENU;
    }

    async scrollTroughMenus(step) {
        const cantina = new Cantina();
        Object.assign(cantina, step.options);
        const attachments = [];
        // For testing just give getDay() a weekday from 1-5.
        const todaysMenu = await cantina.menu.getDay();

        for (const dish of todaysMenu) {
            const menuPart = Object.assign(new Dish(), dish);
            attachments.push(CardFactory
                .adaptiveCard(await CardSchema.prototype
                    .createMenuCard(menuPart)));
        }

        await step.context.sendActivity(MessageFactory.text('Das sind die' +
            ' Gerichte von heute.'));
        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog(cantina);
    }
}

module.exports.TodaysMenuDialog = TodaysMenuDialog;
