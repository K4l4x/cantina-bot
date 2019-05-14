const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'aboutPrices';

class PricesDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;
    }
}

exports.PricesDialog = PricesDialog;
