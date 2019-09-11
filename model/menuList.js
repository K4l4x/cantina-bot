const { CardSchemaCreator } = require('./cardSchemaCreator');
const { MenuScraper } = require('../scraper/menuScraper');

// TODO: Add cantinaName to constructor and use it to build, load, save menus.
class MenuList extends Array {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    // TODO: Check if menus are already build and just load them.
    async fill() {
        // Object.assign(this, await new MenuBuilder().buildMenus());
        Object.assign(this, await new MenuScraper().scrape().then(function(menus) {
            return menus;
        }));
    }

    async today() {
        return this.filter(menu => menu.day === new Date().getDay());
    }

    async getDay(weekday) {
        return this.filter(menu => menu.day === weekday);
    }

    async loadList(cantinaName = 'mensaX', name = 'menus') {
        Object.assign(this, await CardSchemaCreator.prototype
            .loadFromJSON(cantinaName, name));
    }

    async save(cantinaName = 'mensaX', name = 'menus', menus = this) {
        await CardSchemaCreator.prototype
            .saveAsJSON(cantinaName, name, menus);
    }
}

module.exports.MenuList = MenuList;
