const { MenuBuilder } = require('../scraper/menuBuilder');
const { CardSchemaCreator } = require('./cardSchemaCreator');

// TODO: Add cantinaName to constructor and use it to build, load, save menus.
class MenuList extends Array {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    async fill() {
        Object.assign(this, await new MenuBuilder().buildMenus());
    }

    async today() {
        return this.filter(menu => menu.day === new Date().getDay());
    }

    async getDay(weekday) {
        return this.filter(menu => menu.day === weekday);
    }

    async loadList(cantinaName = 'mensaX') {
        Object.assign(this, await CardSchemaCreator.prototype
            .loadFromJSON(cantinaName, 'menus'));
    }

    async save(cantinaName = 'mensaX', menus = this) {
        await CardSchemaCreator.prototype
            .saveAsJSON(cantinaName, 'menus', menus);
    }
}

module.exports.MenuList = MenuList;
