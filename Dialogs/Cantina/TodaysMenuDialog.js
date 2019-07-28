const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCards = require('adaptivecards');
const moment = require('moment');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');
const { Menu } = require('../../Model/Menu');
const { CardSchemaCreator } = require('../../Model/CardSchemaCreator');
const { MenuBuilder } = require('../../Scraper/MenuBuilder');

const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const TODAYS_MENU = 'todaysMenu';

const WEEKDAYS = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5
};

class TodaysMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || TODAYS_MENU_DIALOG);

        this.addDialog(new WaterfallDialog(TODAYS_MENU,
            [
                this.scrollTroughMenus.bind(this)
            ]));

        this.initialDialogId = TODAYS_MENU;
    }

    async scrollTroughMenus(step) {
        const menus = await TodaysMenuDialog.getThisWeeksMenus();
        const todaysDate = moment(Date.now()).format('LL');
        const attachments = [];
        const cardSchema = new CardSchemaCreator();

        menus.forEach(function(current) {
            const menu = Object.assign(new Menu(), current);
            const card = new AdaptiveCards.AdaptiveCard();

            if (menu.date === todaysDate) {
                switch (menu.day) {
                case WEEKDAYS.MONDAY:
                    card.parse(cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.TUESDAY:
                    card.parse(cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    card.clear();
                    break;
                case WEEKDAYS.WEDNESDAY:
                    card.parse(cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.THURSDAY:
                    card.parse(cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.FRIDAY:
                    card.parse(cardSchema.createMenuCard(menu));
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
