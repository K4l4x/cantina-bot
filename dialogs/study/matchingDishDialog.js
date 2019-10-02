const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { Cantina } = require('../../model/cantina');
const { Dish } = require('../../model/dish');

const { JsonOps } = require('../../utilities/jsonOps');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const MATCHING_DISH = 'matchingDish';

class MatchingDishDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || MATCHING_DISH_DIALOG);
        this.addDialog(new WaterfallDialog(MATCHING_DISH, [
            this.prepare.bind(this)
        ]));
        this.initialDialogId = MATCHING_DISH;
    }

    // TODO: Descriptions can contain words like 'hähnchen', could be tricky.
    // TODO: Write algorithm which searches in keys and values, gets the
    //  individual equivalent (Key -> Value, Value -> Key) and searches with
    //  them in the description of the dishes. It Would be great to remove
    //  duplicates before searching in the descriptions. Only with "lables"
    //  the description should also be searched with values.
    async prepare(step) {
        const sampleStudy = step.options;
        const tmpCantina = new Cantina('mensaX');
        await tmpCantina.menu.loadList();
        sampleStudy.cantina = tmpCantina;

        // TODO: Should be done in root dialog or even before that.
        const labels = await JsonOps.prototype
            .loadFrom('utilities', 'labels');
        const allergies = await JsonOps.prototype
            .loadFrom('utilities', 'allergiesRegister');
        const supplements = await JsonOps.prototype
            .loadFrom('utilities', 'supplementsRegister');

        // TODO: Should be done only once
        const labelKeys = Object.keys(labels);
        const labelValues = Object.values(labels);
        const allergiesKeys = Object.keys(allergies);
        const allergiesValues = Object.values(allergies);
        const supplementsKeys = Object.keys(supplements);
        const supplementsValues = Object.values(supplements);

        // TODO: If true look into json.
        const todaysMenu = await sampleStudy.cantina.menu.getDay();

        for (const entry of sampleStudy.notWantedMeets) {
            const meetType = entry.toLowerCase()
                .replace(/\s+/g, '');

            // TODO: if true use meetTypeValue and search in description.
            if (labelKeys.includes(meetType)) {
                console.log('(LabelKeys):' + meetType);
                // TODO: If true look into json.
                const meetTypeValue = labels[meetType];
                console.log('(LabelKeys.findValue): ' + meetType + ' -> ' +
                    meetTypeValue);
            }

            if (labelValues.includes(meetType)) {
                console.log('(LabelValues):' + meetType);
                // TODO: If true look into json.
                for (const entry of todaysMenu) {
                    const dish = new Dish();
                    Object.assign(dish, entry);
                    if (dish.description.includes(meetType)) {
                        console.log('(LookIntoMenus.meetType): ' + meetType);
                    }
                }
            }
        }

        for (const entry of sampleStudy.allergies) {
            const allergyType = entry.toLowerCase()
                .replace(/\s+/g, '');

            // TODO: Works only for first entry (example: A30, A25; A30
            //  works, but A25 gets the old menu list, like A30 never existed.
            if (allergiesKeys.includes(allergyType)) {
                console.log('(AllergiesKeys):' + allergyType);
                console.log('(Menus today): ' + todaysMenu.length);
                // for (const entry of todaysMenu) {
                for (let i = todaysMenu.length - 1; i >= 0; i--) {
                    const entry = todaysMenu[i];
                    if (entry.description.includes(allergyType.toUpperCase())) {
                        console.log('(LookIntoMenus.allergyKeys): ' + allergyType);
                        const indexDish = todaysMenu.indexOf(entry);
                        console.log('(Index of ' + entry.type + '): ' + indexDish);
                        todaysMenu.splice(indexDish, 1);
                        console.log('(Menus after algo): ' + todaysMenu.length);
                        console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                    }
                }
            }

            // TODO: if true get key by value and search with key in
            //  description.
            if (allergiesValues.includes(allergyType)) {
                console.log('(AllergiesValues):' + allergyType);
                const allergyTypeKey = allergiesKeys.find(key => allergies[key] === allergyType);
                console.log('(AllergiesValues.findKey): ' + allergyType + ' -> ' +
                    allergyTypeKey);
                // TODO: If true look into json.
                for (const entry of todaysMenu) {
                    const dish = new Dish();
                    Object.assign(dish, entry);
                    if (dish.description.includes(allergyType)) {
                        console.log('(LookIntoMenus.allergyValues): ' + allergyType);
                    }
                }
            }
        }

        // TODO: if true get key by value and search with key in
        //  description.
        for (const entry of sampleStudy.other) {
            const otherType = entry.toLowerCase()
                .replace(/\s+/g, '');

            if (supplementsKeys.includes(otherType)) {
                console.log('(SupplementsKeys):' + otherType);
                // TODO: If true look into json.
            }

            if (supplementsValues.includes(otherType)) {
                console.log('(SupplementsValues):' + otherType);
                // TODO: If true look into json.
                const otherTypeKey = supplementsKeys.find(key => supplements[key] === otherType);
                console.log('(SupplementsValues.findKey): ' + otherType + ' -> ' +
                    otherTypeKey);
            }
        }

        // await step.context.sendActivity(MessageFactory
        //     .text(JSON.stringify(sampleStudy)));
        return await step.endDialog();
    }
}

module.exports.MatchingDishDialog = MatchingDishDialog;
