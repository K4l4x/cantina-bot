const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const MensaTodayMenu = require('../resources/TodayMenuSample.json');

const initialId = 'menuToday';

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
                this.showMenu.bind(this)
            ]));
    }

    async chooseMensa(step) {
        return await step.prompt('mensaChoicesPrompt', {
            prompt: 'Welchen Mensa Plan von Heute möchtest du sehen?',
            choices: ChoiceFactory.toChoices([{ value: 'Mensa X' }])
        });
    }

    async showMenu(step) {
        if (step.result.value.toString() === 'Mensa X') {
            await step.context.sendActivity({ attachments: [CardFactory.adaptiveCard(MensaTodayMenu)], attachmentLayout: AttachmentLayoutTypes.Carousel });
        } else {
            await step.context.sendActivity([CardFactory.adaptiveCard(MensaTodayMenu)]);
        }
        return await step.endDialog();
    }
}

exports.MenuOfTodayDialog = MenuOfTodayDialog;
