const { MenuList } = require('./menuList');
const { Menu } = require('./menu');

let openingHours;
const menus = new MenuList();

/**
 * Represents a general cantina.
 */
class Cantina {
    constructor(name) {
        this.name = name;
        this.setOpeningHours();
    }

    // TODO: Get hours from website of cantina and fill openingHours.
    setOpeningHours() {
        openingHours = {
            monday: '11:30 - 14:30Uhr',
            tuesday: '11:30 - 14:30Uhr',
            wednesday: '11:30 - 14:30Uhr',
            thursday: '11:30 - 14:30Uhr',
            friday: '11:30 - 14:30Uhr'
        };
    }

    async createMenu() {
        await menus.fill();
    }

    getOpeningHours() {
        return openingHours;
    }

    get menuList() {
        return menus;
    }
}

// TODO: list of menus: add, remove, clear, findByDay, findByType,
//  findByPrice

module.exports.Cantina = Cantina;
