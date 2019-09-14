const { MenuList } = require('./menuList');

const openingHours = {
    monday: '11:30 - 14:30Uhr',
    tuesday: '11:30 - 14:30Uhr',
    wednesday: '11:30 - 14:30Uhr',
    thursday: '11:30 - 14:30Uhr',
    friday: '11:30 - 14:30Uhr'
};

const menus = new MenuList();

/**
 * Represents a general cantina.
 */
class Cantina {
    constructor(name) {
        this.name = name;
    }

    get openingHours() {
        return openingHours;
    }

    get menuList() {
        return menus;
    }
}

module.exports.Cantina = Cantina;
