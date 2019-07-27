const { CantinaScraper } = require('../Scraper/CantinaScraper');
const { Menu } = require('../Model/Menu');
const moment = require('moment');

/**
 *
 */
class MenuBuilder {
    async buildMenus() {
        const menus = [];
        const rawDateTime = await MenuBuilder.getRawDateTime();
        const menuTypes = await MenuBuilder.getMenuTypes();
        const menusPerDay = await MenuBuilder.getMenusPerDay();
        const menuPrices = await MenuBuilder.getPricesPerDay();
        const menuDescriptions = await MenuBuilder.getRawMenus();

        rawDateTime.forEach(function(date) {
            let numberOfMenusPerDay = menusPerDay[rawDateTime.indexOf(date)];

            while (numberOfMenusPerDay !== 0) {
                const parseDate = moment
                    .utc(date.toString().split(',')[1], 'DD-MM-YYYY', 'en');
                const menu = new Menu();
                menu.date = parseDate.format('LL');
                menu.day = parseDate.day();
                menu.menuType = menuTypes.shift();
                menu.description = menuDescriptions.shift();
                menu.prices = menuPrices.shift();
                menus.push(menu);
                numberOfMenusPerDay--;
            }
        });

        return menus;
    }

    static async getRawDateTime() {
        return await CantinaScraper.prototype.requestDateTime().then(function(rawDateTime) {
            return rawDateTime;
        });
    }

    static async getMenusPerDay() {
        return await CantinaScraper.prototype.requestCountMenusPerDay().then(function(menusPerDay) {
            return menusPerDay;
        });
    }

    static async getPricesPerDay() {
        return await CantinaScraper.prototype.requestPricesPerDay().then(function(pricesPerDay) {
            return pricesPerDay;
        });
    }

    static async getMenuTypes() {
        return await CantinaScraper.prototype.requestMenuTypes().then(function(menuTypes) {
            return menuTypes;
        });
    }

    static async getRawMenus() {
        return await CantinaScraper.prototype.requestMenus().then(function(rawMenus) {
            return rawMenus;
        });
    }
}

module.exports.MenuBuilder = MenuBuilder;
