const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const { Menu } = require('../Model/Menu');
const { MenuBuilder } = require('../Scraper/MenuBuilder');
const moment = require('moment');

const initialId = 'welcome';
const dishesPrompt = 'dishesPrompt';
const welcomeInfo = 'Hi, ich bin CantinaBot. \n Du hast bestimmt Hunger! \n Sieh dir die fantastische Auswahl an Gerichten für Heute an! \n';

class WelcomeDialog extends ComponentDialog {
    /**
     *
     * @param dialogId
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        this.addDialog(new ChoicePrompt(dishesPrompt));
        this.addDialog(new WaterfallDialog(initialId,
            [
                this.welcomeMessage.bind(this),
                this.switchTodaysDishes.bind(this)
            ]));
    }

    async welcomeMessage(step) {
        let menus = await WelcomeDialog.getThisWeeksMenus();
        let todaysDate = moment(Date.now()).format('LL');

        var menuTypes = [];

        menus.forEach(async current => {
            let menu = Object.assign(new Menu(), current);

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

        let menus = await WelcomeDialog.getThisWeeksMenus();
        let todaysDate = moment(Date.now()).format('LL');

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
