const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../Utilities/CancelAndHelpDialog');

const WEEK_MENU_DIALOG = 'weekMenuDialog';
const WEEK_MENU = 'weekMenu';

class WeekMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || WEEK_MENU_DIALOG);
        this.addDialog(new WaterfallDialog(WEEK_MENU,
            [

            ]));
        this.initialDialogId = WEEK_MENU;
    }
}

module.exports.WeekMenuDialog = WeekMenuDialog;
