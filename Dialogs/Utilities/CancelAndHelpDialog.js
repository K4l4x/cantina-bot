const { MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
class CancelAndHelpDialog extends ComponentDialog {
    async onContinueDialog(innerDialogContext) {
        const result = await this.interrupt(innerDialogContext);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDialogContext);
    }

    /**
     * Interrupting current dialog to handle a help or cancel request from
     * the user.
     * @param innerDialogContext represents current active dialog/step context.
     * @returns {Promise<{status: DialogTurnStatus.waiting}|{status}|DialogTurnResult>}
     */
    async interrupt(innerDialogContext) {
        if (innerDialogContext.context.activity.text) {
            const text = innerDialogContext.context.activity.text.toLowerCase();

            switch (text) {
            case 'hilfe':
            case '?':
                // TODO: Handling user helplessness.
                const helpText = 'Hier wird bald geholfen!';
                await innerDialogContext.context.sendActivity(MessageFactory.text(helpText));
                return { status: DialogTurnStatus.waiting };
            case 'abbrechen':
            case 'stopp':
                // TODO: Handling lost user, after everything has been canceled.
                const cancelText = 'Okay, ich stoppe...';
                await innerDialogContext.context.sendActivity(MessageFactory.text(cancelText));
                return await innerDialogContext.cancelAllDialogs();
            }
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
