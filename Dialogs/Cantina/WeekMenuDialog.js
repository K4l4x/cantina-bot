const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');

const initialId = 'menuWeek';

// Prompt, Question and choices.
const weekPrompt = 'weekPrompt';
const weekQuestion = 'Aus welcher Woche möchtest du den gesamten Mensaplan sehen?';
const weekBeforeMenu = 'beforeMenu';
const CurrentWeekMenu = 'currentMenu';
const NextWeekMenu = 'nextMenu';

// Weekdays
const mondayMenu = '';
const tuesdayMenu = '';
const wednesdayMenu = '';
const thursdayMenu = '';
const fridayMenu = '';

class WeekMenuDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        this.initialDialogId = initialId;

        this.addDialog(new ChoicePrompt(weekPrompt));
        this.addDialog(new WaterfallDialog(initialId,
            [
                this.chooseWeek.bind(this),
                this.switchWeek.bind(this)
            ]));
    }

    async chooseWeek(step) {
        return await step.prompt(weekPrompt, {
            prompt: weekQuestion,
            choices: ChoiceFactory.toChoices([
                { value: weekBeforeMenu },
                { value: CurrentWeekMenu },
                { value: NextWeekMenu }])
        });
    }

    async switchWeek(step) {
        switch (step.result.value.toString()) {
        case weekBeforeMenu:
            await this.getBeforeWeek();
            await this.showMenu(step);
            break;
        case CurrentWeekMenu:
            await this.getCurrentWeek();
            await this.showMenu(step);
            break;
        case NextWeekMenu:
            await this.getNextWeek();
            await this.showMenu(step);
            break;
        default:
            await this.getCurrentWeek();
            await this.showMenu(step);
            break;
        }
        return await step.endDialog();
    }

    async getBeforeWeek(step) {
        // TODO: Get all menus from the week before and setup the weekday adaptive cards.
    }

    async getCurrentWeek(step) {
        // TODO: Get all menus from the current week and setup the weekday adaptive cards.
    }

    async getNextWeek(step) {
        // TODO: Get all menus from the next week and setup the weekday adaptive cards.
    }

    async showMenu(step) {
        await step.context.sendActivity({ attachments: [
            CardFactory.adaptiveCard(mondayMenu),
            CardFactory.adaptiveCard(tuesdayMenu),
            CardFactory.adaptiveCard(wednesdayMenu),
            CardFactory.adaptiveCard(thursdayMenu),
            CardFactory.adaptiveCard(fridayMenu)],
        attachmentLayout: AttachmentLayoutTypes.Carousel
        });
    }
}

module.exports.MenuOfWeekDialog = WeekMenuDialog;
