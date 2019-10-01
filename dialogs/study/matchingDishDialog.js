const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const MATCHING_DISH = 'matchingDish';

class MatchingDishDialog extends CancelAndHelpDialog{
    constructor(id) {
        super(id || MATCHING_DISH_DIALOG);
        this.addDialog(new WaterfallDialog(MATCHING_DISH, [
            this.prepare.bind(this)
        ]));
        this.initialDialogId = MATCHING_DISH;
    }

    async prepare(step) {
        await step.context.sendActivity(MessageFactory
            .text('Matching stuff.'));
        return await step.endDialog();
    }
}

module.exports.MatchingDishDialog = MatchingDishDialog;
