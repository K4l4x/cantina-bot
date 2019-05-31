const { CantinaScraper } = require('../Scraper/CantinaScraper');
var { Menu } = require('../Model/Menu');
var moment = require('moment');

/**
 *
 */
class MenuBuilder {
    async buildMenus() {
        let menus = [];
        const rawDateTime = await this.getRawDateTime();
        const pricesPerDay = await this.getPricesPerDay();
        const menusPerDay = await this.getMenusPerDay();
        const menuTypes = await this.getMenuTypes();
        const menuDescriptions = await this.prepareMenuDescriptions();

        rawDateTime.forEach(function(date) {
            let numberOfMenusPerDay = menusPerDay[rawDateTime.indexOf(date)];
            let allMenus = numberOfMenusPerDay;
            while (numberOfMenusPerDay !== 0) {
                let parseDate = moment.utc(date.toString().split(',')[1], 'DD-MM-YYYY', 'en');
                let menu = new Menu();
                menu.date = parseDate.format('LL');
                menu.day = parseDate.day();
                menu.menuType = menuTypes[allMenus - numberOfMenusPerDay];
                menu.description = menuDescriptions.shift();
                menus.push(menu);
                numberOfMenusPerDay--;
            }
        });

        // return menus;

        // console.log(menus);
        // console.log(rawDateTime);
        // console.log(menusPerDay);
        // console.log(menuTypes);
        console.log(pricesPerDay);
    }

    async prepareMenuDescriptions() {
        const rawMenus = await this.getRawMenus();
        const menuDescriptions = [];

        rawMenus.forEach(function(description) {
            let descriptionMess = description;
            let modifiedInfoTextString = ' Es können 3 Wahlbeilagen gewählt werden: ';
            let priceByString = 'Preis pro 100 g';
            let takeWithString = 'auch zum Mitnehmen!';
            let modifiedExtrasString = ' Dazu gibt es: ';

            descriptionMess = descriptionMess.replace(
                new RegExp('Es können 3 Wahlbeilagen gewählt werden:'), modifiedInfoTextString
            );
            descriptionMess = descriptionMess.replace(
                new RegExp('Dazu gibt es:'), modifiedExtrasString
            );
            descriptionMess = descriptionMess.replace(
                new RegExp(priceByString), ''
            );

            description = descriptionMess.replace(
                new RegExp(takeWithString), ''
            );

            menuDescriptions.push(description);
        });

        // console.log(menuDescriptions);
        return menuDescriptions;
    }

    async getRawDateTime() {
        return await CantinaScraper.prototype.requestDateTime().then(function(rawDateTime) {
            return rawDateTime;
        });
    }

    async getMenusPerDay() {
        return await CantinaScraper.prototype.requestCountMenusPerDay().then(function(menusPerDay) {
            return menusPerDay;
        });
    }

    async getPricesPerDay() {
        return await CantinaScraper.prototype.requestPricesPerDay().then(function(pricesPerDay) {
            return pricesPerDay;
        });
    }

    async getMenuTypes() {
        return await CantinaScraper.prototype.requestMenuTypes().then(function(menuTypes) {
            return menuTypes;
        });
    }

    async getRawMenus() {
        return await CantinaScraper.prototype.requestMenus().then(function(rawMenus) {
            return rawMenus;
        });
    }
}

exports.MenuBuilder = MenuBuilder;
