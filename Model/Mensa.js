// Menu
// operations on Cafeteria like updateMenu, DeleteMenu, NewMenu

// const { Menu } = require('/Model/Menu');

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
