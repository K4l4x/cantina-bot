const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const moment = require('moment');

const { CancelAndHelpDialog } = require('./Utilities/CancelAndHelpDialog');
const { Menu } = require('../Model/Menu');
const { MenuBuilder } = require('../Scraper/MenuBuilder');

const WELCOME_DIALOG = 'welcomeDialog';
const WELCOME = 'welcome';

const dishesPrompt = 'dishesPrompt';
const welcomeInfo = 'Hi, ich bin CantinaBot. \n Du hast bestimmt Hunger! \n Sieh dir die fantastische Auswahl an Gerichten für Heute an! \n';

class WelcomeDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || WELCOME_DIALOG);
        this.addDialog(new ChoicePrompt(dishesPrompt));
        this.addDialog(new WaterfallDialog(WELCOME,
            [
                this.welcomeMessage.bind(this),
                this.switchTodaysDishes.bind(this)
            ]));
        this.initialDialogId = WELCOME;
    }

    async welcomeMessage(step) {
        const menus = await WelcomeDialog.getThisWeeksMenus();
        const todaysDate = moment(Date.now()).format('LL');

        var menuTypes = [];

        menus.forEach(async current => {
            const menu = Object.assign(new Menu(), current);

            if (menu.date === todaysDate) {
                menuTypes.push(menu.menuType[0]);
            }
        });

        return await step.prompt(dishesPrompt, {
            prompt: welcomeInfo,
            choices: ChoiceFactory.toChoices(menuTypes),
            style: 1
        });
    }

    async switchTodaysDishes(step) {
        // await step.context.sendActivity(step.result.value);

        // const menus = await WelcomeDialog.getThisWeeksMenus();
        // const todaysDate = moment(Date.now()).format('LL');

        // menus.forEach(async current => {
        //     let menu = Object.assign(new Menu(), current);
        //
        //     if (menu.date === todaysDate
        //         && menu.menuType === step.result.value.toString()) {
        //         step.context.sendActivity('Im heutigen '
        //             + step.result.value.toString() + ' gibt es ' + menu.);
        //     }
        //
        // })

        return await step.endDialog();
    }

    static async getThisWeeksMenus() {
        const builder = new MenuBuilder();
        return await builder.buildMenus();
    }
}

exports.WelcomeDialog = WelcomeDialog;
