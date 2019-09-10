const { MenuList } = require('./menuList');

let openingHours;
const menus = new MenuList();

/**
 * Represents a general cantina.
 */
class Cantina {
    constructor(name) {
        this.name = name;
    }

    // TODO: Get hours from website of cantina and fill openingHours.
    set openingHours(hours) {
        openingHours = {
            monday: '11:30 - 14:30Uhr',
            tuesday: '11:30 - 14:30Uhr',
            wednesday: '11:30 - 14:30Uhr',
            thursday: '11:30 - 14:30Uhr',
            friday: '11:30 - 14:30Uhr'
        };
    }

    async createMenuList() {
        await menus.fill();
    }

    get openingHours() {
        return openingHours;
    }

    get menuList() {
        return menus;
    }

    async restoreMenuList(week = 'menus') {
        await menus.loadList(this.name, week);
    }
}

module.exports.Cantina = Cantina;
