// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, TurnContext } = require('botbuilder');

// const MENU_STATE_PROPERTY = 'menuState';

class CantinaBot extends ActivityHandler {
    constructor(cantinaState, conversationState, userState, dialog, conversationReferences) {
        super();
        if (!cantinaState) {
            throw new Error('[CantinaBot]: Missing' +
                ' parameter. CantinaState is required');
        }
        if (!conversationState) {
            throw new Error('[CantinaBot]: Missing' +
            ' parameter. ConversationState is required');
        }
        if (!userState) {
            throw new Error('[CantinaBot]: Missing parameter.' +
            ' UserState is required');
        }
        if (!dialog) {
            throw new Error('[CantinaBot]: Missing parameter.' +
            ' Dialog is required');
        }

        // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
        this.conversationReferences = conversationReferences;

        // Record the conversation and user state management objects.
        this.cantinaState = cantinaState;
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('[CantinaBot]: Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.cantinaState.saveChanges(context, false);
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onConversationUpdate(async (context, next) => {
            this.addConversationReference(context.activity);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        // this.conversationReferences[conversationReference.conversation.id]
        // = conversationReference;
        this.conversationReferences['telegram/conversations/1823731/'] = conversationReference;
    }
}

module.exports.CantinaBot = CantinaBot;
