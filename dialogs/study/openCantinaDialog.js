const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { Study } = require('../../model/study');

const OPEN_CANTINA_DIALOG = 'openCantinaDialog';
const OPEN = 'open';

class OpenCantinaDialog extends CancelAndHelpDialog{
    constructor(id) {
        super(id || OPEN_CANTINA_DIALOG);
        this.addDialog(new WaterfallDialog(OPEN,
            [
                this.prepare.bind(this)
            ]));
        this.initialDialogId = OPEN;
    }

    async prepare(step) {

    }
}

module.exports.OpenCantinaDialog = OpenCantinaDialog;
