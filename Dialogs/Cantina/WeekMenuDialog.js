const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const AdaptiveCards = require('adaptivecards');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');
const { CardSchemaCreator } = require('../../Model/CardSchemaCreator');
const { Cantina } = require('../../Model/Cantina');
const { Menu } = require('../../Model/Menu');

const WEEK_MENU_DIALOG = 'weekMenuDialog';
const WEEK_MENU = 'weekMenu';

const WEEK_DAYS_PROMPT = 'weekDaysPrompt';
const WEEK_DAYS_MESSAGE = 'Von welchem Tag soll ich dir das Menü zeigen?';

const weekdayChoices = ['Montag', 'Dienstag', 'Mittwoch',
    'Donnerstag', 'Freitag'];

const WEEKDAYS = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4
};

class WeekMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || WEEK_MENU_DIALOG);
        this.addDialog(new ChoicePrompt(WEEK_DAYS_PROMPT));
        this.addDialog(new WaterfallDialog(WEEK_MENU,
            [
                this.prepareWeek.bind(this),
                this.showDayMenu.bind(this)
            ]));
        this.initialDialogId = WEEK_MENU;
    }

    async prepareWeek(step) {
        return await step.prompt(WEEK_DAYS_PROMPT, {
            prompt: WEEK_DAYS_MESSAGE,
            choices: ChoiceFactory.toChoices(weekdayChoices),
            style: 1
        });
    }

    async showDayMenu(step) {
        const card = new AdaptiveCards.AdaptiveCard();
        const attachments = [];

        const result = step.result.value;
        const cantina = Object.assign(new Cantina(), step.options);
        let menus = [];

        switch (result) {
        case weekdayChoices[WEEKDAYS.MONDAY]:
            menus = await cantina.menusOfDay(WEEKDAYS.MONDAY);
            break;
        case weekdayChoices[WEEKDAYS.TUESDAY]:
            menus = await cantina.menusOfDay(WEEKDAYS.TUESDAY);
            break;
        case weekdayChoices[WEEKDAYS.WEDNESDAY]:
            menus = await cantina.menusOfDay(WEEKDAYS.WEDNESDAY);
            break;
        case weekdayChoices[WEEKDAYS.THURSDAY]:
            menus = await cantina.menusOfDay(WEEKDAYS.THURSDAY);
            break;
        case weekdayChoices[WEEKDAYS.FRIDAY]:
            menus = await cantina.menusOfDay(WEEKDAYS.FRIDAY);
            break;
        default:
            break;
        }

        for (const current of menus) {
            const menu = Object.assign(new Menu(), current);
            card.parse(await CardSchemaCreator.prototype.createMenuCard(menu));
            attachments.push(CardFactory.adaptiveCard(card));
        }

        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog(cantina);
    }
}

module.exports.WeekMenuDialog = WeekMenuDialog;
