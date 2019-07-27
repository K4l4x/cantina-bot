const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCards = require('adaptivecards');
const { Menu } = require('../Model/Menu');
const { MenuCardSchema } = require('../Model/MenuCardSchema');
const moment = require('moment');
const { MenuBuilder } = require('../Scraper/MenuBuilder');

// Mensa X menu.
// const MensaTodayMenu = require('../resources/MensaX/TodaysMenu/MainMenuCard.json');
// const VeggieTodayMenu = require('../resources/MensaX/TodaysMenu/VeggieMenuCard.json');
// const VitalTodayMenu = require('../resources/MensaX/TodaysMenu/VitalMenuCard.json');
// const PastaTodayMenu = require('../resources/MensaX/TodaysMenu/MenuPastaCard.json');
// const { TextBlock } = require('adaptivecards/lib/card-elements');

const initialId = 'menuToday';

const WEEKDAYS = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5
};

class TodaysMenuDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        this.addDialog(new WaterfallDialog(initialId,
            [
                this.scrollTroughMenus.bind(this)
            ]));
    }

    async scrollTroughMenus(step) {
        let menus = await TodaysMenuDialog.getThisWeeksMenus();
        let todaysDate = moment(Date.now()).format('LL');
        const attachments = [];
        const menuCard = new MenuCardSchema();

        menus.forEach(function(current) {
            let menu = Object.assign(new Menu(), current);
            let card = new AdaptiveCards.AdaptiveCard();

            if (menu.date === todaysDate) {
                switch (menu.day) {
                case WEEKDAYS.MONDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.TUESDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    card.clear();
                    break;
                case WEEKDAYS.WEDNESDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.THURSDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.FRIDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                default:
                    break;
                }
            }
        });

        await step.context.sendActivity({ attachments: attachments, attachmentLayout: AttachmentLayoutTypes.Carousel });
        return await step.endDialog();
    }

    static async getThisWeeksMenus() {
        const builder = new MenuBuilder();
        return await builder.buildMenus();
    }
}

module.exports.TodaysMenuDialog = TodaysMenuDialog;
