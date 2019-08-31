const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./Utilities/CancelAndHelpDialog');

const ALLERGENIC_DIALOG = 'allergenicDialog';
const ABOUT_ALLERGENIC = 'aboutAllergenic';

class AllergenicDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || ALLERGENIC_DIALOG);
        this.addDialog(new WaterfallDialog(ABOUT_ALLERGENIC,
            [

            ]));
        this.initialDialogId = ABOUT_ALLERGENIC;
    }
}

module.exports.AllergenicDialog = AllergenicDialog;
