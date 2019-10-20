const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { CardSchema } = require('../../utilities/cardSchema');
const { Cantina } = require('../../model/cantina');
const { Dish } = require('../../model/dish');
const Meets = require('../../resources/utilities/meets');
const Allergies = require('../../resources/utilities/allergiesRegister');
const Supplements = require('../../resources/utilities/supplementsRegister');

const MATCHING_DISH_DIALOG = 'matchingDishDialog';
const MATCHING_DISH = 'matchingDish';

class MatchingDishDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || MATCHING_DISH_DIALOG);
        this.addDialog(new WaterfallDialog(MATCHING_DISH, [
            this.findDish.bind(this)
        ]));
        this.initialDialogId = MATCHING_DISH;
    }

    // TODO: Remove duplicates before searching in the descriptions. Only
    //  with "lables" the description should also be searched with values.
    async findDish(step) {
        const study = step.options;
        const tmpCantina = new Cantina('mensaX');
        await tmpCantina.menu.loadList();
        study.cantina = tmpCantina;

        // TODO: Should be done only once
        const allergiesKeys = Object.keys(Allergies);
        const allergiesValues = Object.values(Allergies);
        const supplementsKeys = Object.keys(Supplements);
        const supplementsValues = Object.values(Supplements);

        // Get todays menu to search in it.
        // For testing just give getDay() a weekday from 1-5.
        const todaysMenu = await study.cantina.menu.getDay();

        if (study.isVegetarian || study.isVegan) {
            for (let i = todaysMenu.length - 1; i >= 0; i--) {
                const entry = todaysMenu[i];
                if (Meets.some(meet => entry.description.toLowerCase().includes(meet))) {
                    console.log('(LookIntoMenus.meets): ' + entry.type + ' has' +
                        ' meet');
                    const indexDish = todaysMenu.indexOf(entry);
                    console.log('(Index of ' + entry.type + '): ' + indexDish);
                    todaysMenu.splice(indexDish, 1);
                    console.log('(Menus after algo): ' + todaysMenu.length);
                    console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                }
            }
        }

        if (study.isVegan) {
            const notVegan = ['a22', 'a23', 'a26'];
            for (const part of notVegan) {
                if (!study.allergies.includes(part)) {
                    study.allergies.push(part);
                }
            }
            console.log('[Matching]: Is Vegan, add specific' +
                ' "allergies"');
            console.log('[Matching]: Size of allergies list: ' +
                study.allergies.length);
        }

        for (const entry of study.notWantedMeets) {
            const meetType = entry.toLowerCase()
                .replace(/\s+/g, '');
            if (Meets.includes(meetType)) {
                console.log('(Meets):' + meetType);
                for (let i = todaysMenu.length - 1; i >= 0; i--) {
                    const entry = todaysMenu[i];
                    if (entry.description.toLowerCase().includes(meetType)) {
                        console.log('(LookIntoMenus.meetType): ' + meetType);
                        const indexDish = todaysMenu.indexOf(entry);
                        console.log('(Index of ' + entry.type + '): ' + indexDish);
                        todaysMenu.splice(indexDish, 1);
                        console.log('(Menus after algo): ' + todaysMenu.length);
                        console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                    }
                }
            }
        }

        console.log('[Matching]: Size of notWanted Meets: ' +
            study.notWantedMeets.length);

        for (const entry of study.allergies) {
            const allergyType = entry.toLowerCase()
                .replace(/\s+/g, '');

            if (allergiesKeys.includes(allergyType)) {
                console.log('(AllergiesKeys):' + allergyType);
                console.log('(Menus today): ' + todaysMenu.length);

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

            if (allergiesValues.includes(allergyType)) {
                console.log('(AllergiesValues):' + allergyType);
                const allergyTypeKey = allergiesKeys.find(key => Allergies[key] === allergyType);
                console.log('(AllergiesValues.findKey): ' + allergyType + ' -> ' +
                    allergyTypeKey);

                for (let i = todaysMenu.length - 1; i >= 0; i--) {
                    const entry = todaysMenu[i];
                    if (entry.description.includes(allergyTypeKey.toUpperCase())) {
                        console.log('(LookIntoMenus.allergyTypeKey): ' + allergyTypeKey);
                        const indexDish = todaysMenu.indexOf(entry);
                        console.log('(Index of ' + entry.type + '): ' + indexDish);
                        todaysMenu.splice(indexDish, 1);
                        console.log('(Menus after algo): ' + todaysMenu.length);
                        console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                    }
                }
            }
        }

        for (const entry of study.supplements) {
            const otherType = entry.toLowerCase()
                .replace(/\s+/g, '');

            if (supplementsKeys.includes(otherType)) {
                console.log('(SupplementsKeys):' + otherType);
                for (let i = todaysMenu.length - 1; i >= 0; i--) {
                    const entry = todaysMenu[i];
                    if (entry.description.includes(otherType.toUpperCase())) {
                        console.log('(LookIntoMenus.otherType): ' + otherType);
                        const indexDish = todaysMenu.indexOf(entry);
                        console.log('(Index of ' + entry.type + '): ' + indexDish);
                        todaysMenu.splice(indexDish, 1);
                        console.log('(Menus after algo): ' + todaysMenu.length);
                        console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                    }
                }
            }

            if (supplementsValues.includes(otherType)) {
                console.log('(SupplementsValues):' + otherType);
                const otherTypeKey = supplementsKeys.find(key => Supplements[key] === otherType);
                console.log('(SupplementsValues.findKey): ' + otherType + ' -> ' +
                    otherTypeKey);

                for (let i = todaysMenu.length - 1; i >= 0; i--) {
                    const entry = todaysMenu[i];
                    if (entry.description.includes(otherTypeKey.toUpperCase())) {
                        console.log('(LookIntoMenus.otherTypeKey): ' + otherTypeKey);
                        const indexDish = todaysMenu.indexOf(entry);
                        console.log('(Index of ' + entry.type + '): ' + indexDish);
                        todaysMenu.splice(indexDish, 1);
                        console.log('(Menus after algo): ' + todaysMenu.length);
                        console.log('(Menus after algo): ' + JSON.stringify(todaysMenu));
                    }
                }
            }
        }

        const attachments = [];

        for (const dish of todaysMenu) {
            const menuPart = Object.assign(new Dish(), dish);
            attachments.push(CardFactory
                .adaptiveCard(await CardSchema.prototype
                    .createMenuCard(menuPart)));
        }

        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        return await step.endDialog(study);
    }
}

module.exports.MatchingDishDialog = MatchingDishDialog;
