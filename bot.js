// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, MessageFactory } = require('botbuilder');
const { DialogSet, WaterfallDialog, Dialog, DialogTurnStatus } = require('botbuilder-dialogs');

// Import component dialog.
const { ProfileDialog } = require("./profileDialog");

const DIALOG_STATE_PROPERTY = 'dialogStatePropertyAccessor';

class MyBot {    
    /**
     * Currently empty.
     * Manages different states.
     */
    constructor(conversationState) {
        // Record the conversation and user state management objects.
        this.conversationState = conversationState

        // Create our state property accessors.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // Create our bot's dialog set, adding a main dialog and the three component dialogs.
        this.dialogs = new DialogSet(this.dialogStateAccessor)
            .add(new ProfileDialog('profile'));
    }

    /**
     *
     * @param {turnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const dialogContext = await this.dialogs.createContext(turnContext);
            const dialogTurnResult = await dialogContext.continueDialog();
        
            await dialogContext.beginDialog('profile');

            // Keeping an eye on the dialog result in current turn.
            // if (dialogTurnResult.status === DialogTurnStatus.complete) {
            // }
            // else {
            //     await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
            // }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }

        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

module.exports.MyBot = MyBot;
