const { MessageFactory, AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory, ListStyle } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { CardSchema } = require('../../utilities/cardSchema');
const { Cantina } = require('../../model/cantina');

const WEEK_MENU = 'weekMenu';
const WEEK_MENU_DIALOG = 'weekMenuDialog';
const WEEK_DAYS_PROMPT = 'weekDaysPrompt';
const WEEK_DAYS_MESSAGE = 'Von welchem Tag soll ich dir das Menü zeigen?';

const weekdayChoices = ['Montag', 'Dienstag', 'Mittwoch',
    'Donnerstag', 'Freitag'];

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
        console.log('[WeekMenuDialog]: prepare week menu and show weekdays');
        return await step.prompt(WEEK_DAYS_PROMPT, {
            prompt: MessageFactory.text(WEEK_DAYS_MESSAGE),
            choices: ChoiceFactory.toChoices(weekdayChoices),
            style: ListStyle.suggestedAction
        });
    }

    async showDayMenu(step) {
        console.log('[WeekMenuDialog]: show menu by user selection');
        const attachments = [];
        const result = step.result.value;
        // Has to be done here, otherwise the dialog will not recognize
        // cantina object and will run into an error if I want to get the
        // menu from day (line 47-53) that the user has selected.
        const cantina = new Cantina();
        Object.assign(cantina, step.options);

        // Adding one because monday starts at one and friday is represented
        // by five. Either way, this saves ~10 lines of a switch-case.
        // console.log(weekdayChoices.indexOf(result) + 1);
        const selectedDay = weekdayChoices.indexOf(result) + 1;
        const menus = await cantina.menu.getDay(selectedDay);

        for (const dish of menus) {
            attachments
                .push(CardFactory
                    .adaptiveCard(await CardSchema.prototype
                        .createMenuCard(dish)));
        }

        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog();
    }
}

module.exports.WeekMenuDialog = WeekMenuDialog;
