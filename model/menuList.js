const { JsonOps } = require('../utilities/jsonOps');
const { MenuScraper } = require('../utilities/menuScraper');

// TODO: Add cantinaName to constructor and use it to build, load, save menus.
class MenuList extends Array {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
        this.today = new Date().getDay();
    }

    // TODO: Check if menus are already build and just load them.
    async fill() {
        // Object.assign(this, await new MenuBuilder().buildMenus());
        Object.assign(this, await MenuScraper.prototype.scrape().then(function(menus) {
            return menus;
        }));
    }

    async getDay(weekday = this.today) {
        return this.filter(menu => menu.day === weekday);
    }

    async loadList(cantinaName = 'mensaX', name = 'menus') {
        Object.assign(this, await JsonOps.prototype
            .loadFrom(cantinaName, name));
    }

    async save(cantinaName = 'mensaX', name = 'menus', menus = this) {
        await JsonOps.prototype.saveAs(cantinaName, name, menus);
    }
}

module.exports.MenuList = MenuList;
