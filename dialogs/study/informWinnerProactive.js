const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const INFORM_WINNER = 'informWinner';

class InformWinnerProactive extends ComponentDialog {
    constructor(id) {
        super(id);
        this.addDialog(new WaterfallDialog(INFORM_WINNER,
            [

            ]));
        this.initialDialogId = INFORM_WINNER;
    }
}

module.exports.InformWinnerProactive = InformWinnerProactive;
