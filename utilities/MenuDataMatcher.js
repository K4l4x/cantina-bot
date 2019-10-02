const { Dish } = require('../model/dish');

// TODO: Only one should be used, but not global, because not async.
const todaysMenu = sampleStudy.cantina.menu.getDay();

class MenuDataMatcher {
    async findEntry(object) {
        for (const entry of object) {
            const elem = entry.toLowerCase()
                .replace(/\s+/g, '');
            await this.searchInKeys(elem);
            await this.searchInValues(elem);
            await this.searchInDescriptions(object, elem);
        }
    }

    async searchInKeys(keyValues, elem) {
        if (Object.keys(keyValues).includes(elem)) {
            console.log('(Key):' + elem);
            const elemValue = keyValues[elem];
            console.log('(Key.findValue): ' + elem + ' -> ' + elemValue);
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

    async searchInDescriptions(sampleStudy, elem) {
        for (let i = todaysMenu.length - 1; i >= 0; i--) {
            const dish = todaysMenu[i];
            if (dish.description.includes(elem.toUpperCase())) {
                console.log('(LookIntoMenus.Keys): ' + elem);
                await this.removeDish(sampleStudy, dish);
            }
        }
    }

    async removeDish(sampleStudy, dish) {
        const dishIndex = todaysMenu.indexOf(dish);
        console.log('(Index of ' + dish.type + '): ' + dishIndex);
        todaysMenu.splice(dishIndex, 1);
    }
}

module.exports.MenuDataMatcher = MenuDataMatcher;
