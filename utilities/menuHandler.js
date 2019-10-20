const Allergies = require('../resources/utilities/allergiesRegister');
const Supplements = require('../resources/utilities/supplementsRegister');
const MeetParts = require('../resources/utilities/meetParts');
const Meets = require('../resources/utilities/meets');

// TODO: Main part is todaysMenu

class MenuHandler {
    // Overall modular, but still to many for-loops and complicated structure.
    async reduceDishesByPreferences(study) {
        const todaysMenu = await study.cantina.menu.getDay();
        await this.checkMeetInterest(study, todaysMenu);
        await this.searchInData(study.notWantedMeets, todaysMenu);
        await this.searchInData(study.allergies, todaysMenu);
        await this.searchInData(study.supplements, todaysMenu);
    }

    async searchInData(userData, todaysMenu) {
        for (const entry of userData) {
            const elem = entry.toLowerCase()
                .replace(/\s+/g, '');
            await this.searchInKeys(elem);
            await this.searchInValues(elem);
            await this.searchInDescriptions(elem);
        }
    }

    // Can be made better by creating a function out of the second if and pass
    // it into searchInDescriptions, but requires more work.
    async checkMeetInterest(study, todaysMenu) {
        if (study.isVegetarian || study.isVegan) {
            for (let i = todaysMenu.length - 1; i >= 0; i--) {
                const dish = todaysMenu[i];
                if (Meets.some(meet => dish.description.toLowerCase().includes(meet))) {
                    console.log('(LookIntoMenus.meets): ' + dish.type + ' has' +
                        ' meet in it.');
                    await this.removeDish(todaysMenu, dish);
                }
            }
        }

        if (study.isVegan) {
            const notVegan = ['a22', 'a23', 'a26'];
            for (const entry of notVegan) {
                if (!study.allergies.includes(entry)) {
                    study.allergies.push(entry);
                }
            }
            console.log('[Matching]: Is Vegan, add specific' +
                ' "allergies"');
            console.log('[Matching]: Size of allergies list: ' +
                study.allergies.length);
        }
    }

    async searchInKeys(keyValues, elem) {
        if (Object.keys(keyValues).includes(elem)) {
            console.log('(Key):' + elem);
            const elemValue = keyValues[elem];
            console.log('(Key.findValue): ' + elem + ' -> ' + elemValue);
            // await this.searchInDescriptions()
        }
    }

    async searchInValues(keyValues, elem) {
        if (Object.values(keyValues).includes(elem)) {
            console.log('(Value):' + elem);
            const elemKey = Object.keys(keyValues)
                .find(key => keyValues[key] === elem);
            console.log('(Value.findKey): ' + elem + ' -> ' + elemKey);
        }
    }

    async searchInDescriptions(todaysMenu, elem) {
        for (let i = todaysMenu.length - 1; i >= 0; i--) {
            const dish = todaysMenu[i];
            if (dish.description.includes(elem.toUpperCase())) {
                console.log('(LookIntoMenus.Keys): ' + elem);
                await this.removeDish(dish);
            }
        }
    }

    async removeDish(todaysMenu, dish) {
        const dishIndex = todaysMenu.indexOf(dish);
        console.log('(Index of ' + dish.type + '): ' + dishIndex);
        todaysMenu.splice(dishIndex, 1);
    }
}

module.exports.MenuHandler = MenuHandler;
