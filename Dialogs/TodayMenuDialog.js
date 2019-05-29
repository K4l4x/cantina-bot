const { CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
var AdaptiveCards = require('adaptivecards');
const { MenuScraper } = require('../Scraper/MenuScraper');
var { Menu } = require('../Model/Menu');

// Mensa X menu.
// const MensaTodayMenu = require('../resources/MensaX/TodaysMenu/MainMenuCard.json');
// const VeggieTodayMenu = require('../resources/MensaX/TodaysMenu/VeggieMenuCard.json');
// const VitalTodayMenu = require('../resources/MensaX/TodaysMenu/VitalMenuCard.json');
// const PastaTodayMenu = require('../resources/MensaX/TodaysMenu/MenuPastaCard.json');
// const { TextBlock } = require('adaptivecards/lib/card-elements');

const initialId = 'menuToday';

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

        var menuCard = [];

        menus.forEach(function(current) {
            let menu = Object.assign(new Menu(), current);
            if (Date.parse(menu.date) === new Date()) {
                menuCard.push({
                    'type': 'AdaptiveCard',
                    'body': [
                        {
                            'type': 'Container',
                            'items': [
                                {
                                    'type': 'TextBlock',
                                    'size': 'Medium',
                                    'weight': 'Bolder',
                                    'text': menu.menuType
                                },
                                {
                                    'type': 'TextBlock',
                                    'text': menu.description,
                                    'wrap': true
                                },
                                {
                                    'type': 'FactSet',
                                    'facts': [
                                        {
                                            'title': 'Studierende:',
                                            'value': '2,70€'
                                        },
                                        {
                                            'title': 'Bedienstete:',
                                            'value': '4,40€'
                                        },
                                        {
                                            'title': 'Gäste:',
                                            'value': '5,30€'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                    'version': '1.0'
                });
            }
        });

        console.log(menuCard[0]);

        let card = new AdaptiveCards.AdaptiveCard();

        card.parse(menuCard[0]);
        await step.context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
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
