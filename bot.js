// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

// Require sample dialogs.
// const { ProfileDialog } = require('./Dialogs/profileDialog');

// Current mensa dialog set.
// const { MenuDialog } = require('./Dialogs/MenuDialog');
// const { WeekMenuDialog } = require('./Dialogs/WeekMenuDialog');
const { WelcomeDialog } = require('./Dialogs/WelcomeDialog');
const { TodaysMenuDialog } = require('./Dialogs/TodaysMenuDialog');
const { OpeningHoursDialog } = require('./Dialogs/OpeningHoursDialog');
// const { AllergenicDialog } = require('./Dialogs/AllergenicDialog');

const DIALOG_STATE_PROPERTY = 'dialogStatePropertyAccessor';
const USER_STATE_PROPERTY = 'userStatePropertyAccessor';

// const MENU_STATE_PROPERTY = 'menuState';

class MyBot {
    /**
     * Currently empty.
     * Manages different states.
     */
    constructor(conversationState, userState) {
        // Create our state property accessors.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userStateAccessor = userState.createProperty(USER_STATE_PROPERTY);

        // Record the conversation and user state management objects.
        this.conversationState = conversationState;
        this.userState = userState;

        // Create our bot's dialog set, adding a main dialog and the three component dialogs.
        this.dialogs = new DialogSet(this.dialogStateAccessor);
        this.dialogs.add(new WelcomeDialog('welcome'));
        // this.dialogs.add(new MenuDialog('aboutMenu'));
        // this.dialogs.add(new AllergenicDialog('aboutAllergenic'));
        this.dialogs.add(new TodaysMenuDialog('menuToday'));
        // this.dialogs.add(new MenuOfWeekDialog('menuWeek'));
        // this.dialogs.add(new PricesDialog('aboutPrices'));
        this.dialogs.add(new OpeningHoursDialog('openingHours'));
    }

    /**
     *
     * @param {turnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const dialogContext = await this.dialogs.createContext(turnContext);
            await dialogContext.continueDialog();

            if (dialogContext.context.activity.text.includes('hi')) {
                await dialogContext.beginDialog('welcome');
            }

            if (dialogContext.context.activity.text.includes('heute')) {
                await dialogContext.beginDialog('menuToday');
            }

            if (dialogContext.context.activity.text.includes('öffnungszeiten')) {
                await dialogContext.beginDialog('openingHours');
            }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }

        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

module.exports.MyBot = MyBot;
