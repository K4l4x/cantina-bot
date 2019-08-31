const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCards = require('adaptivecards');
const moment = require('moment');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');
const { Cantina } = require('../../Model/Cantina');
const { Menu } = require('../../Model/Menu');
const { CardSchemaCreator } = require('../../Model/CardSchemaCreator');

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
        this.addDialog(new WaterfallDialog(TODAYS_MENU, [
            this.scrollTroughMenus.bind(this)
        ]));
        this.initialDialogId = TODAYS_MENU;
    }

    async scrollTroughMenus(step) {
        const cantina = Object.assign(new Cantina(), step.options);
        const attachments = [];
        // // Test for weekends SATURDAY -> THURSDAY; SUNDAY -> WEDNESDAY.
        const todaysDate = moment(Date.now()).subtract(4,
            'days').format('LL');

        // const todaysDate = moment(Date.now()).format('LL');
        const cardSchema = new CardSchemaCreator();

        // console.log(todaysDate);

        for (const current of cantina.menuList) {
            const menu = Object.assign(new Menu(), current);
            const card = new AdaptiveCards.AdaptiveCard();

            // console.log(menu.date);

            if (menu.date === todaysDate) {
                switch (menu.day) {
                case WEEKDAYS.MONDAY:
                    card.parse(await cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.TUESDAY:
                    card.parse(await cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.WEDNESDAY:
                    card.parse(await cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.THURSDAY:
                    card.parse(await cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.FRIDAY:
                    card.parse(await cardSchema.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                default:
                    break;
                }
            }
        }

        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog(cantina);
    }
}

module.exports.TodaysMenuDialog = TodaysMenuDialog;
