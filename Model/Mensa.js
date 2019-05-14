/**
 * Represents an entire part of the mensa system.
 * Every mensa has it's own menus and opening hours.
 */
class Mensa {
    constructor(name, menus, openingHours, generalInfo) {
        this.name = name;
        this.menus = menus;
        this.openingHours = openingHours;
        this.generalInfo = generalInfo;
    }

    getName() {
        return this.name;
    }

    getMenus() {
        return this.menus;
    }

    getHours() {
        return this.openingHours;
    }

    getInfo() {
        return this.generalInfo;
    }
}

exports.Mensa = Mensa;
