const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
// Mensa X - Smaples
const MensaTodayMenu = require('../resources/MensaX/TodayMenuSample.json');
const VeggieTodayMenu = require('../resources/MensaX/TodayMenuVeggieSample.json');
const VitalTodayMenu = require('../resources/MensaX/TodayMenuVitalSample.json');
const PastaTodayMenu = require('../resources/MensaX/TodayMenuPastaSample.json');

// Cafeteria X - Samples
const FirstTodayMenu = require('../resources/CafeteriaX/TodayMenuFirstSample.json');
const SecondTodayMenu = require('../resources/CafeteriaX/TodayMenuSecondSample.json');

// Westend - Samples
const WestendMenuOneToday = require('../resources/Westend/TodayMenuOneSample.json');
const WestendMenuTwoToday = require('../resources/Westend/TodayMenuTwoSample.json');

const initialId = 'menuToday';

const mensaX = 'Mensa X';
const cafeteriaX = 'Cafeteria X';
const westend = 'Westend';

class MenuOfTodayDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        this.addDialog(new ChoicePrompt('mensaChoicesPrompt'));
        this.addDialog(new WaterfallDialog(initialId,
            [
                this.chooseMensa.bind(this),
                this.switchMenus.bind(this)
            ]));
    }

    async chooseMensa(step) {
        return await step.prompt('mensaChoicesPrompt', {
            prompt: 'Welchen Mensa Plan von Heute möchtest du sehen?',
            choices: ChoiceFactory.toChoices([{ value: mensaX }, { value: cafeteriaX }, { value: westend }])
        });
    }

    async switchMenus(step) {
        switch (step.result.value.toString()) {
        case mensaX:
            await step.context.sendActivity({ attachments: [
                CardFactory.adaptiveCard(MensaTodayMenu),
                CardFactory.adaptiveCard(VeggieTodayMenu),
                CardFactory.adaptiveCard(VitalTodayMenu),
                CardFactory.adaptiveCard(PastaTodayMenu)],
            attachmentLayout: AttachmentLayoutTypes.Carousel });
            break;
        case cafeteriaX:
            await step.context.sendActivity({ attachments: [
                CardFactory.adaptiveCard(FirstTodayMenu),
                CardFactory.adaptiveCard(SecondTodayMenu)],
            attachmentLayout: AttachmentLayoutTypes.Carousel
            });
            break;
        case westend:
            await step.context.sendActivity({ attachments: [
                CardFactory.adaptiveCard(WestendMenuOneToday),
                CardFactory.adaptiveCard(WestendMenuTwoToday)],
            attachmentLayout: AttachmentLayoutTypes.Carousel
            });
            break;
        default:
            break;
        }

        return await step.endDialog();
    }

    async showMenu(step) {

    }
}

exports.MenuOfTodayDialog = MenuOfTodayDialog;
