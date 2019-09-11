// using native, because only basic functionality is needed.
const _promise = require('request-promise-native');
const _cheerio = require('cheerio');
const moment = require('moment');
const { Menu } = require('../model/menu');

const mensaXmenuURI = 'http://www.studierendenwerk-bielefeld.de/essen-trinken/essen-und-trinken-in-mensen/bielefeld/mensa-gebaeude-x.html';

/**
 * Uses nested cheerio to create a JQuery object with the contents of the
 * given mensa URI.
 * @type {{transform: (function(*=): *), uri: *}}
 */
const options = {
    uri: mensaXmenuURI,
    transform: function(body) {
        return _cheerio.load(body);
    }
};

/**
 * A simple WebCrawler and scraper to get every menu detail from the
 * university of Bielefeld.
 */
class MenuScraper {
    async scrape() {
        return _promise(options)
            .then(async function getDates($) {
                const dates = await MenuScraper.prototype.prepareDates($);
                const menusPerDay = await MenuScraper.prototype.countMenusPerDay($);
                const menuPrices = await MenuScraper.prototype.prepareMenuPrices($);
                const menuTypes = await MenuScraper.prototype.prepareMenuTypes($);
                const menuDescriptions = await MenuScraper.prototype.prepareMenuDescriptions($);

                return await MenuScraper.prototype.buildMenus(
                    dates,
                    menusPerDay,
                    menuPrices,
                    menuTypes,
                    menuDescriptions);
            })
            .catch(function(err) {
                console.log('Error scraping menu web page with message: ' + err);
            });
    }

    async prepareDates($) {
        const dates = [];

        // Extracting weekdays and dates. Also remove all spaces,
        // before adding to rawDates.
        $('#c1367').find('h2').each(function(index, item) {
            const rawDate = $(item).text().replace(/\s+/g, '');
            dates[index] = moment.utc(rawDate.toString().split(',')[1],
                'DD-MM-YYYY',
                'en');
        });

        // console.log(dates);
        return dates;
    }

    async countMenusPerDay($) {
        const countsPerDay = [];

        // Extracting all menus, which are listed in '.odd' and
        // '.even' containers.
        // Counting them to check how many menus are on each day.
        $('.stripedtable').each(function(index, item) {
            countsPerDay.push($(item).find('.odd').get().length +
                $(item).find('.even').get().length);
        });

        // console.log(countsPerDay);
        return countsPerDay;
    }

    async prepareMenuPrices($) {
        const priceSeparator = new RegExp(/\|/gm);
        const rawPrices = [];

        // Extracting all prices from every menu and formatting them.
        $('.stripedtable').find('td[width="150px"]').each(function(index, item) {
            const price = $(item).text().replace(/\s+/gm, ' ');
            if (price.includes('€')) {
                rawPrices.push([' ', ' ', price]);
            } else if (price.match(priceSeparator)) {
                const studentPrice = price.split('|')[0] + '€';
                const staffPrice = price.split('|')[1] + '€';
                const guestPrice = price.split('|')[2] + '€';
                rawPrices.push([studentPrice, staffPrice, guestPrice]);
            } else {
                rawPrices.push([' ', ' ', ' ']);
            }
        });

        // console.log(rawPrices);
        return rawPrices;
    }

    async prepareMenuTypes($) {
        const rawMenuTypes = [];

        // Extracting all types of menus and removing empty lines and tabs.
        $('.stripedtable').find('strong').each(function(index, item) {
            rawMenuTypes[index] = $(item).text().replace(/\s+/gm, ' ');
        });

        // console.log(rawMenuTypes);
        return rawMenuTypes;
    }

    async prepareMenuDescriptions($) {
        const extrasTextString = new RegExp(/Es können 3 Wahlbeilagen gewählt werden:/gm);
        const priceByPattern = new RegExp(/Preis pro 100\s?g/gm);
        const takeWithString = new RegExp(/auch zum Mitnehmen!/gm);
        const otherExtrasTextString = new RegExp(/Dazu gibt es:/gm);
        const rawMenus = [];

        // Extracting all menu descriptions and reformatting them.
        $('.stripedtable').find('.first').not(':empty').each(function(index, item) {
            let description = $(item).find('p').not('.menu-detail').text().replace(/\s+/gm, ' ');
            description = description.replace(
                extrasTextString, '\n\n Es können 3 Wahlbeilagen gewählt werden: '
            );
            description = description.replace(
                otherExtrasTextString, '\n\n Dazu gibt es: '
            );
            description = description.replace(
                priceByPattern, '\n\n Preis pro 100g'
            );

            description = description.replace(
                takeWithString, '\n\n Auch zum Mitnehmen!'
            );

            rawMenus.push(description);
        });

        // console.log(rawMenus);
        return rawMenus;
    }

    async buildMenus(dates, menusPerDay, menuPrices, menuTypes, menuDescriptions) {
        const menus = [];
        dates.forEach(function(date) {
            let numberOfMenusPerDay = menusPerDay[dates.indexOf(date)];
            while (numberOfMenusPerDay !== 0) {
                const menu = new Menu(
                    date.format('LL'),
                    date.day(),
                    menuTypes.shift(),
                    menuPrices.shift(),
                    menuDescriptions.shift(),
                );

                menus.push(menu);
                numberOfMenusPerDay--;
            }
        });

        console.log(menus);
        return menus;
    }
}

module.exports.MenuScraper = MenuScraper;
