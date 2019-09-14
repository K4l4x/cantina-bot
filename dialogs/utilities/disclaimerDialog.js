const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./utilities/cancelAndHelpDialog');

const DISCLAIMER_DIALOG = 'disclaimerDialog';
const DISCLAIMER = 'disclaimer';

class DisclaimerDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || DISCLAIMER_DIALOG);
        this.addDialog(new WaterfallDialog(DISCLAIMER,
            [

            ]));
        this.initialDialogId = DISCLAIMER;
    }
}
module.exports.DisclaimerDialog = DisclaimerDialog;
