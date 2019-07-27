const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'aboutMenu';

class MenuDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;
    }
}

exports.MenuDialog = MenuDialog;
