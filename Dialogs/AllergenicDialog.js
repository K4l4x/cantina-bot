const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'aboutAllergenic';

class AllergenicDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;
    }
}

exports.AllergenicDialog = AllergenicDialog;
