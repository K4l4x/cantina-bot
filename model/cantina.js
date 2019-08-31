const { Menu } = require('./menu');

var openingHours;

let menus = [];

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

    getOpeningHours() {
        return openingHours;
    }

    set menuList(list) {
        menus = list;
    }

    get menuList() {
        return menus;
    }

    addMenu(menu) {
        menus.push(Object.assign(new Menu(), menu));
    }

    removeMenu(index) {
        menus.splice(index - 1, index);
    }

    clearMenus() {
        menus = [];
    }

    async menusOfDay(dayOfWeek) {
        return menus[dayOfWeek];
    }
}

// TODO: list of menus: add, remove, clear, findByDay, findByType,
//  findByStatus,
//  findByPrice

module.exports.Cantina = Cantina;
