const { MenuList } = require('./menuList');

const openingHours = {
    monday: '11:30 - 14:30Uhr',
    tuesday: '11:30 - 14:30Uhr',
    wednesday: '11:30 - 14:30Uhr',
    thursday: '11:30 - 14:30Uhr',
    friday: '11:30 - 14:30Uhr'
};

// TODO: Let Cantina handle all menu and dishes stuff. Yes! Menu and Dishes.
/**
 * Represents a general cantina.
 */
class Cantina {
    constructor(name) {
        this.name = name;
        this.menus = new MenuList();
    }

    get openingHours() {
        return openingHours;
    }

    get menuList() {
        return this.menus;
    }
}

module.exports.Cantina = Cantina;
