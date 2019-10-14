const { MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the openCantina logic.
 */
class OpenCancelHelpDialog extends ComponentDialog {
    async onContinueDialog(innerDialogContext) {
        const result = await this.interrupt(innerDialogContext);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDialogContext);
    }

    /**
     * Interrupting openCantina dialog to handle a help or cancel request
     * from the user.
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
                message = 'Mit **"stopp"** und **"abbrechen"** kannst du mich' +
                    ' jederzeit unterbrechen.\n\n' +
                    'Du kannst mir erzählen worauf ich achten muss oder auf' +
                    ' was du verzichten möchtest:\n\n' +
                    '-> **"Bitte kein Fleisch"**\n\n' +
                    '-> **"Ich verzichte auf Schwein"**\n\n' +
                    '-> **"ich vertrage kein Sesam"**\n\n' +
                    '-> **"Pute mag ich nicht"**\n\n' +
                    '-> **"Ich bin Veganer"**\n\n' +
                    '-> **"Ich bin allergisch gegen Soja"**\n\n' +
                    '-> **"Erdnüsse vertrage ich nicht"**';
                await innerDialogContext.context.sendActivity(MessageFactory.text(message));
                return { status: DialogTurnStatus.waiting };
            case 'abbrechen':
            case 'stopp':
                message = 'Okay, ich breche alles ab. Wenn du nicht weißt,' +
                        ' was du mir schreiben kannst, schreib mir **"hilfe"**';
                await innerDialogContext.context.sendActivity(MessageFactory.text(message));
                return await innerDialogContext.cancelAllDialogs();
            }
        }
    }
}

module.exports.OpenCancelHelpDialog = OpenCancelHelpDialog;
