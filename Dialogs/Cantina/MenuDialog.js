const { ComponentDialog } = require('botbuilder-dialogs');

const ABOUT_MENU = 'aboutMenu';

class MenuDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        this.initialDialogId = ABOUT_MENU;
    }
}

module.exports.MenuDialog = MenuDialog;
