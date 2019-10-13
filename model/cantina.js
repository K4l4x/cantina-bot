const { Menu } = require('./menu');

const menu = new Menu(); // TODO: is this okay or bad practice?

const openingHours = {
    monday: '11:30 - 14:30Uhr',
    tuesday: '11:30 - 14:30Uhr',
    wednesday: '11:30 - 14:30Uhr',
    thursday: '11:30 - 14:30Uhr',
    friday: '11:30 - 14:30Uhr'
};

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

    get menu() {
        return menu;
    }
}

module.exports.Cantina = Cantina;
