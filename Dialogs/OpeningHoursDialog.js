const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'openingHours';

class OpeningHoursDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;
    }
}

exports.OpeningHoursDialog = OpeningHoursDialog;
