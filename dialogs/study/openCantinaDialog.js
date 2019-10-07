const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { LuisRecognizer } = require('botbuilder-ai');

const { Study } = require('../../model/study');

const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN = 'open';

class OpenCantinaDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || OPEN_CANTINA_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new WaterfallDialog(OPEN,
            [
                this.prepare.bind(this)
            ]));
        this.initialDialogId = OPEN;
    }

    async prepare(step) {
        if (this.luisRecognizer.isConfigured) {
            const luisResult = await this.luisRecognizer.executeQuery(step.context);
            if (LuisRecognizer.topIntent(luisResult) === 'isVegan') {
                await step.context.sendActivity(
                    MessageFactory.text('Hit isVegan Intent'));
            } else {
                await step.context.sendActivity(
                    MessageFactory.text('None Intent hit'));
            }
        }
        return await step.endDialog();
    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
