const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
var AdaptiveCards = require('adaptivecards');
const { MenuScraper } = require('../Scraper/MenuScraper');
var { Menu } = require('../Model/Menu');
var { MenuCardSchema } = require('../Model/MenuCardSchema');
var moment = require('moment');

// Mensa X menu.
// const MensaTodayMenu = require('../resources/MensaX/TodaysMenu/MainMenuCard.json');
// const VeggieTodayMenu = require('../resources/MensaX/TodaysMenu/VeggieMenuCard.json');
// const VitalTodayMenu = require('../resources/MensaX/TodaysMenu/VitalMenuCard.json');
// const PastaTodayMenu = require('../resources/MensaX/TodaysMenu/MenuPastaCard.json');
// const { TextBlock } = require('adaptivecards/lib/card-elements');

const initialId = 'menuToday';

var WEEKDAYS = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5
};

class TodayMenuDialog extends ComponentDialog {
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

    // async scrollTroughMenus(step) {
    //     await this.getToday();
    //     await step.context.sendActivity({ attachments: [
    //         CardFactory.adaptiveCard(MensaTodayMenu),
    //         CardFactory.adaptiveCard(VeggieTodayMenu),
    //         CardFactory.adaptiveCard(VitalTodayMenu),
    //         CardFactory.adaptiveCard(PastaTodayMenu)],
    //     attachmentLayout: AttachmentLayoutTypes.Carousel });
    //     return await step.endDialog();
    // }
    //

    async scrollTroughMenus(step) {
        let menus = await this.getToday();

        let weekDay = new Date().getDay();

        let attachments = [];

        const menuCard = new MenuCardSchema();

        menus.forEach(function(current) {
            let card = new AdaptiveCards.AdaptiveCard();

            let menu = Object.assign(new Menu(), current);

            if (menu.date !== moment().toDate()) {
                console.log(menu.date);
            }


            switch (weekDay) {
            case WEEKDAYS.MONDAY:
                card.parse(menuCard.getMenuCard(menu.menuType, menu.description));
                attachments.push(CardFactory.adaptiveCard(card));
                break;
            case WEEKDAYS.TUESDAY:
                card.parse(menuCard.getMenuCard(menu.menuType, menu.description));
                attachments.push(CardFactory.adaptiveCard(card));
                break;
            case WEEKDAYS.WEDNESDAY:
                card.parse(menuCard.getMenuCard(menu.menuType, menu.description));
                attachments.push(CardFactory.adaptiveCard(card));
                break;
            case WEEKDAYS.THURSDAY:
                card.parse(menuCard.getMenuCard(menu));
                attachments.push(CardFactory.adaptiveCard(card));
                break;
            case WEEKDAYS.FRIDAY:
                card.parse(menuCard.getMenuCard(menu.menuType, menu.description));
                attachments.push(CardFactory.adaptiveCard(card));
                break;
            default:
                break;
            }

            // if (menu.day === 'Freitag') {
            //     card.parse(menuCard.getMenuCard(menu.menuType, menu.description));
            //     attachments.push(CardFactory.adaptiveCard(card));
            // }
        });

        // console.log(await menuCard.getMenuCard());

        await step.context.sendActivity({ attachments: attachments, attachmentLayout: AttachmentLayoutTypes.Carousel });

        return await step.endDialog();
    }

    async getToday() {
        // TODO: Get the today's menu and fill all relevant adaptive cards.

        return await MenuScraper.prototype.requestMenus().then(function(menus) {
            return menus;
        });
    }
}

exports.TodayMenuDialog = TodayMenuDialog;
