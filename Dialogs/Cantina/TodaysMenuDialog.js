const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCards = require('adaptivecards');
const moment = require('moment');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');
const { Menu } = require('../../Model/Menu');
const { MenuCardSchema } = require('../../Model/MenuCardSchema');
const { MenuBuilder } = require('../../Scraper/MenuBuilder');

const MENU_TODAY = 'menuToday';

const WEEKDAYS = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5
};

class TodaysMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id);

        this.addDialog(new WaterfallDialog(MENU_TODAY,
            [
                this.scrollTroughMenus.bind(this)
            ]));

        this.initialDialogId = MENU_TODAY;
    }

    async scrollTroughMenus(step) {
        const menus = await TodaysMenuDialog.getThisWeeksMenus();
        const todaysDate = moment(Date.now()).format('LL');
        const attachments = [];
        const menuCard = new MenuCardSchema();

        menus.forEach(function(current) {
            const menu = Object.assign(new Menu(), current);
            const card = new AdaptiveCards.AdaptiveCard();

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
