const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const initialId = 'menuOperation';

/*
* Simple item class.
* Represents elements on a menu.
* */
class Item {
    // var CostForStudent = 0;
    // var CostForGuest = 0;
    // var CostForEmployee = 0;
    // var IsVegan = false;
    // var IsVeggie = false;

    constructor(name) {
        this.name = name;
    }

    // Returns item name;
    get getItemName() {
        return this.name;
    }

    set setDescription(text) {
        this.description = text;
    }

    get getDescription() {
        return this.description;
    }

    set setIngredients(text) {
        this.description = text;
    }

    get getIngredients() {
        return this.description;
    }
}

class Menu {
    constructor(day) {
        this.items = [];
        this.day = day;
    }

    set setDay(dayName) {
        this.day = dayName;
    }

    get getDay() {
        return this.day;
    }

    addItem(item) {
        this.items.push(item);
    }

    showItems() {
        return this.items;
    }
}

class MenuOperationDialog extends ComponentDialog {
    /**
     *
     * @param {dialogID} identifies this dialog.
     */
    constructor(dialogId) {
        super(dialogId);

        this.initialDialogId = initialId;

        let menu = new Menu();

        let item = new Item('Currywurst und Pommes Rotweiß');
        let item2 = new Item('Gemüse Pizza');

        menu.addItem(item);
        menu.addItem(item2);
        const { getItemName: name } = menu.items[0];

        // Define the conversation flow using a waterfall model.
        this.addDialog(
            new WaterfallDialog(
                initialId, [
                    async function(step) {
                        await step.context.sendActivity(name);
                        // End the dialog.
                        return await step.endDialog();
                    }
                ]
            )
        );
    }
}
exports.MenuOperationDialog = MenuOperationDialog;
