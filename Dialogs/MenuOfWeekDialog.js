const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'menuWeek';

class MenuOfWeekDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;
    }
}

exports.MenuOfWeekDialog = MenuOfWeekDialog;
