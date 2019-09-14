const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { Study } = require('../../model/study');

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const GUIDED = 'guided';

class GuidedCantinaDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || GUIDED_CANTINA_DIALOG);
        this.addDialog(new WaterfallDialog(GUIDED,
            [
                this.firstTest.bind(this)
            ]));
        this.initialDialogId = GUIDED;
    }

    async firstTest(step) {
        const study = Object.assign(new Study(), step.options);
        console.log(study);
        return await step.endDialog();
    }
}

module.exports.GuidedCantinaDialog = GuidedCantinaDialog;
