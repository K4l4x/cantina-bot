const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { JsonOps } = require('../../utilities/jsonOps');
const { TodaysMenuDialog } = require('../cantina/todaysMenuDialog');
const { Cantina } = require('../../model/cantina');

const WELCOME_DIALOG = 'welcomeDialog';
const WELCOME = 'welcome';

const dishesPrompt = 'dishesPrompt';
const welcomeInfo = 'Hi, ich bin CantinaBot. \n Du hast bestimmt Hunger! \n' +
    ' Sieh dir die fantastische Auswahl an Gerichten für Heute an! \n';
const welcomeChoices = ['Über CantinaBot', 'Ansprechpartner', 'Menü Heute'];

const LABELS = {
    ABOUT: 0,
    CONTACT: 1,
    TODAYSMENU: 2
};

const TODAYS_MENU_DIALOG = 'todaysMenuDialog';

class WelcomeDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || WELCOME_DIALOG);
        this.addDialog(new TodaysMenuDialog(TODAYS_MENU_DIALOG));
        this.addDialog(new ChoicePrompt(dishesPrompt));
        this.addDialog(new WaterfallDialog(WELCOME,
            [
                this.welcomeMessage.bind(this),
                this.switchTodaysMenus.bind(this),
                this.showContact.bind(this)
            ]));
        this.initialDialogId = WELCOME;
    }

    async welcomeMessage(step) {
        return await step.prompt(dishesPrompt, {
            prompt: welcomeInfo,
            choices: ChoiceFactory.toChoices(welcomeChoices),
            style: 1
        });
    }

    async switchTodaysMenus(step) {
        const result = step.result.value;
        const cantina = Object.assign(new Cantina(), step.options);

        switch (result) {
        case welcomeChoices[LABELS.ABOUT]:
            // TODO: Begin AboutBot Dialog.
            console.log(result);
            break;
        case welcomeChoices[LABELS.CONTACT]:
            console.log(result);
            return await step.next();
        case welcomeChoices[LABELS.TODAYSMENU]:
            console.log(result);
            return await step.replaceDialog(TODAYS_MENU_DIALOG, cantina);
        default:
            return await step.endDialog();
        }
    }

    async showContact(step) {
        const attachments = [CardFactory.adaptiveCard(await JsonOps.prototype
            .loadFrom('contactCards', 'hbCard'))];

        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog();
    }
}

module.exports.WelcomeDialog = WelcomeDialog;
