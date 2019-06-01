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
        const menusPerDay = await this.getMenusPerDay();
        const menuTypes = await this.getMenuTypes();
        const menuPrices = await this.prepareMenuPrices();
        const menuDescriptions = await this.prepareMenuDescriptions();

        rawDateTime.forEach(function(date) {
            let numberOfMenusPerDay = menusPerDay[rawDateTime.indexOf(date)];
            let allMenus = numberOfMenusPerDay;

            while (numberOfMenusPerDay !== 0) {
                let parseDate = moment.utc(date.toString().split(',')[1], 'DD-MM-YYYY', 'en');
                let menu = new Menu();
                menu.date = parseDate.format('LL');
                menu.day = parseDate.day();
                menu.menuType = menuTypes[allMenus - numberOfMenusPerDay]; // TODO Contains bug, mutiplies entire list up to 5 lists, because of iteration.
                menu.description = menuDescriptions.shift();
                menu.prices = menuPrices.shift(); // TODO Contains bug, mutiplies entire list up to 5 lists, because of iteration.
                menus.push(menu);
                numberOfMenusPerDay--;
            }
        });

        return menus;

        // console.log(menus);
        // console.log(rawDateTime);
        // console.log(menusPerDay);
        // console.log(menuTypes);
    }

    async prepareMenuPrices() {
        const pricesPerDay = await this.getPricesPerDay();
        const menuPrices = [];

        pricesPerDay.forEach(function(price) {
            let priceFormats = price;

            if (priceFormats.includes('€')) {
                menuPrices.push([' ', ' ', priceFormats]);
            } else if (priceFormats.match(new RegExp(/\|/gm))) {
                let studentPrice = priceFormats.split('|')[0] + '€';
                let staffPrice = priceFormats.split('|')[1] + '€';
                let guestPrice = priceFormats.split('|')[2] + '€';
                menuPrices.push([studentPrice, staffPrice, guestPrice]);
            } else {
                menuPrices.push([' ', ' ', ' ']);
            }
        });

        return menuPrices;
    }

    async prepareMenuDescriptions() {
        const rawMenus = await this.getRawMenus();
        const menuDescriptions = [];

        rawMenus.forEach(function(description) {
            let descriptionMess = description;
            let modifiedInfoTextString = ' Es können 3 Wahlbeilagen gewählt werden: ';
            let priceByPattern = new RegExp(/Preis pro 100\s?g/gm);
            let takeWithString = 'auch zum Mitnehmen!';
            let modifiedExtrasString = '\n\n Dazu gibt es: ';

            descriptionMess = descriptionMess.replace(
                new RegExp('Es können 3 Wahlbeilagen gewählt werden:'), modifiedInfoTextString
            );
            descriptionMess = descriptionMess.replace(
                new RegExp('Dazu gibt es:'), modifiedExtrasString
            );
            descriptionMess = descriptionMess.replace(
                priceByPattern, '\n\n Preis pro 100g'
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
