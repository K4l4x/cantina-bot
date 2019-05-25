const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const MenuScraper = require('../Scraper/MenuScraper');

// Mensa X menu.
const MensaTodayMenu = require('../resources/MensaX/TodaysMenu/MainMenuCard.json');
const VeggieTodayMenu = require('../resources/MensaX/TodaysMenu/VeggieMenuCard.json');
const VitalTodayMenu = require('../resources/MensaX/TodaysMenu/VitalMenuCard.json');
const PastaTodayMenu = require('../resources/MensaX/TodaysMenu/MenuPastaCard.json');

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

    async scrollTroughMenus(step) {
        await this.getToday();
        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(MensaTodayMenu),
            CardFactory.adaptiveCard(VeggieTodayMenu),
            CardFactory.adaptiveCard(VitalTodayMenu),
            CardFactory.adaptiveCard(PastaTodayMenu)],
        attachmentLayout: AttachmentLayoutTypes.Carousel });
        return await step.endDialog();
    }

    async getToday() {
        // TODO: Get the today's menu and fill all relevant adaptive cards.

        // let weekDays = [];
        // var menuTypes = [];
        // var mondayMenu = [];

        let weekDays = await MenuScraper.MenuScraper.prototype.requestWeekDays().then(function(days) {
            return new Array(days);
        });

        // await MenuScraper.MenuScraper.prototype.requestMenuTypes();



        // menus = await MenuScraper.MenuScraper.prototype.requestMenus();

        // mondayMenu = weekDays.map(function(index, elem) {
        //     return [elem, menuTypes[index]];
        // });

        //console.log(mondayMenu.toString());

        // console.log(
        //     'weekDays:' + weekDays + '\n' + 'menuTypes:' + menuTypes + '\n' + 'menus:' + menus + '\n'
        // );
    }
}

exports.TodayMenuDialog = TodayMenuDialog;
