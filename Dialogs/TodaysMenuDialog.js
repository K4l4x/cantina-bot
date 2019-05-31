const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
var AdaptiveCards = require('adaptivecards');
const { CantinaScraper } = require('../Scraper/CantinaScraper');
var { Menu } = require('../Model/Menu');
var { MenuCardSchema } = require('../Model/MenuCardSchema');
var moment = require('moment');
var { MenuBuilder } = require('../Scraper/MenuBuilder');

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
        let menus = await this.getToday();

        let todaysDate = moment(Date.now()).format('LL');
        // let todaysDate = moment('2019-06-02').format('LL');

        let attachments = [];

        const menuCard = new MenuCardSchema();

        menus.forEach(function(current) {
            let card = new AdaptiveCards.AdaptiveCard();

            let menu = Object.assign(new Menu(), current);

            if (menu.date === todaysDate) {
                switch (menu.day) {
                case WEEKDAYS.MONDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
                    break;
                case WEEKDAYS.TUESDAY:
                    card.parse(menuCard.createMenuCard(menu));
                    attachments.push(CardFactory.adaptiveCard(card));
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

    async getToday() {
        // TODO: Get the today's menu and fill all relevant adaptive cards.

        // console.log(await CantinaScraper.prototype.requestDateTime().then(function(dateTime) {
        //     return dateTime;
        // }));

        // console.log(await CantinaScraper.prototype.requestMenus().then(function(menus) {
        //     return menus;
        // }));

        let builder = new MenuBuilder();
        // return await builder.buildMenus();

        console.log(await builder.buildMenus());
    }
}

exports.TodaysMenuDialog = TodaysMenuDialog;
