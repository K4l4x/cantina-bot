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
        let message = '';
        if (innerDialogContext.context.activity.text) {
            const text = innerDialogContext.context.activity.text.toLowerCase();

            switch (text) {
            case 'hilfe':
            case '?':
                // TODO: Handling user helplessness.
                message = 'Mit **stopp** und **abbrechen** kannst du mich' +
                    ' jederzeit unterbrechen.\n\n' +
                    ' Sonst frage mich z.B. gerne:\n\n' +
                    ' "was gibt es heute zu essen?"\n\n' +
                    ' "was gibt es diese woche zu essen?"\n\n' +
                    ' "sag mir die öffnungszeiten"';
                await innerDialogContext.context.sendActivity(MessageFactory.text(message));
                return { status: DialogTurnStatus.waiting };
            case 'abbrechen':
            case 'stopp':
                // TODO: Handling lost user, after everything has been canceled.
                message = 'Okay, ich stoppe...';
                await innerDialogContext.context.sendActivity(MessageFactory.text(message));
                return await innerDialogContext.cancelAllDialogs();
            }
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
