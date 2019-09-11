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
class CantinaScraper {
    async requestBody() {
        return _promise(options)
            .then(async function getDates($) {
                const menus = [];
                const dates = await CantinaScraper.prototype.prepareDates($);
                const menusPerDay = await CantinaScraper.prototype.countMenusPerDay($);
                const menuPrices = await CantinaScraper.prototype.prepareMenuPrices($);
                const menuTypes = await CantinaScraper.prototype.prepareMenuTypes($);
                const menuDescriptions = await CantinaScraper.prototype.prepareMenuDescriptions($);

                dates.forEach(function(date) {
                    let numberOfMenusPerDay = menusPerDay[dates.indexOf(date)];
                    while (numberOfMenusPerDay !== 0) {
                        const parseDate = moment
                            .utc(date.toString().split(',')[1],
                                'DD-MM-YYYY',
                                'en');


                        const menu = new Menu(
                            parseDate.format('LL'),
                            parseDate.day(),
                            menuTypes.shift(),
                            menuDescriptions.shift(),
                            menuPrices.shift()
                        );

                        menus.push(menu);
                        numberOfMenusPerDay--;
                    }
                });

                return menus;
            })
            .catch(function(err) {
                console.log('Error scraping webpage with message: ' + err);
            });
    }

    async prepareDates($) {
        const rawDates = [];

        // Extracting weekdays and dates. Also remove all spaces,
        // before adding to rawDates.
        $('#c1367').find('h2').each(function(index, item) {
            rawDates[index] = $(item).text().replace(/\s+/g, '');
        });

        console.log(rawDates);
        return rawDates;
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

        console.log(countsPerDay);
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

        console.log(rawPrices);
        return rawPrices;
    }

    async prepareMenuTypes($) {
        const rawMenuTypes = [];

        // Extracting all types of menus and removing empty lines and tabs.
        $('.stripedtable').find('strong').each(function(index, item) {
            rawMenuTypes[index] = [$(item).text().replace(/\s+/gm, ' ')];
        });

        console.log(rawMenuTypes);
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

        console.log(rawMenus);
        return rawMenus;
    }

    // -----------------------------------------------------------------

    // /**
    //  * Returns the dates and matching weekdays as strings in an array.
    //  * @returns {Promise<T>}
    //  */
    // async requestDateTime() {
    //     return _promise(options)
    //         .then(function($) {
    //             const rawDates = [];
    //             // Extracting weekdays and dates. Also remove all spaces, before adding to rawDates.
    //             $('#c1367').find('h2').each(function(index, item) {
    //                 rawDates[index] = $(item).text().replace(/\s+/g, '');
    //             });
    //             return rawDates;
    //         })
    //         .catch(function(PossibleNullPointerException) {
    //             console.log(PossibleNullPointerException);
    //         });
    // }
    //
    // /**
    //  * Returns the count of menus per day.
    //  * @returns {Promise<T>}
    //  */
    // async requestCountMenusPerDay() {
    //     return _promise(options)
    //         .then(function($) {
    //             const countsPerDay = [];
    //             // Extracting all menus, which are listed in '.odd' and '.even' containers.
    //             // Counting them to check how many menus are on each day.
    //             $('.stripedtable').each(function(index, item) {
    //                 countsPerDay.push($(item).find('.odd').get().length +
    //                     $(item).find('.even').get().length);
    //             });
    //             return countsPerDay;
    //         })
    //         .catch(function(PossibleNullPointerException) {
    //             console.log(PossibleNullPointerException);
    //         });
    // }
    //
    // /**
    //  * Returns all prices by each menu of every day of the current week.
    //  * Simple array so one can simply iterate through the prices.
    //  * @returns {Promise<T>}
    //  */
    // async requestPricesPerDay() {
    //     return _promise(options)
    //         .then(function($) {
    //             const priceSeparator = new RegExp(/\|/gm);
    //             const rawPrices = [];
    //             // Extracting all prices from every menu and formatting them.
    //             $('.stripedtable').find('td[width="150px"]').each(function(index, item) {
    //                 const price = $(item).text().replace(/\s+/gm, ' ');
    //                 if (price.includes('€')) {
    //                     rawPrices.push([' ', ' ', price]);
    //                 } else if (price.match(priceSeparator)) {
    //                     const studentPrice = price.split('|')[0] + '€';
    //                     const staffPrice = price.split('|')[1] + '€';
    //                     const guestPrice = price.split('|')[2] + '€';
    //                     rawPrices.push([studentPrice, staffPrice, guestPrice]);
    //                 } else {
    //                     rawPrices.push([' ', ' ', ' ']);
    //                 }
    //             });
    //             return rawPrices;
    //         })
    //         .catch(function(PossibleNullPointerException) {
    //             console.log(PossibleNullPointerException);
    //         });
    // }
    //
    // /**
    //  * Returns all menu types from given mensa URI with cheerio.
    //  * Simple array so one can simply iterate through the types.
    //  * @returns {Promise<T>}
    //  */
    // async requestMenuTypes() {
    //     return _promise(options)
    //         .then(function($) {
    //             const rawMenuTypes = [];
    //             // Extracting all tyes of menus and removing empty lines and tabs.
    //             $('.stripedtable').find('strong').each(function(index, item) {
    //                 rawMenuTypes[index] = [$(item).text().replace(/\s+/gm, ' ')];
    //             });
    //             return rawMenuTypes;
    //         })
    //         .catch(function(PossibleNullPointerException) {
    //             console.log(PossibleNullPointerException);
    //         });
    // }
    //
    // /**
    //  * Returns all menus from given mensa URI with cheerio.
    //  * Also it already formats the whole description ready for presenting.
    //  * @returns {Promise<T>}
    //  */
    // async requestMenus() {
    //     return _promise(options)
    //         .then(function($) {
    //             const extrasTextString = new RegExp(/Es können 3 Wahlbeilagen gewählt werden:/gm);
    //             const priceByPattern = new RegExp(/Preis pro 100\s?g/gm);
    //             const takeWithString = new RegExp(/auch zum Mitnehmen!/gm);
    //             const otherExtrasTextString = new RegExp(/Dazu gibt es:/gm);
    //             const rawMenus = [];
    //             // Extracting all menu descriptions and reformatting them.
    //             $('.stripedtable').find('.first').not(':empty').each(function(index, item) {
    //                 let description = $(item).find('p').not('.menu-detail').text().replace(/\s+/gm, ' ');
    //                 description = description.replace(
    //                     extrasTextString, '\n\n Es können 3 Wahlbeilagen gewählt werden: '
    //                 );
    //                 description = description.replace(
    //                     otherExtrasTextString, '\n\n Dazu gibt es: '
    //                 );
    //                 description = description.replace(
    //                     priceByPattern, '\n\n Preis pro 100g'
    //                 );
    //
    //                 description = description.replace(
    //                     takeWithString, '\n\n Auch zum Mitnehmen!'
    //                 );
    //
    //                 rawMenus.push(description);
    //             });
    //             return rawMenus;
    //         })
    //         .catch(function(PossibleNullPointerException) {
    //             console.log(PossibleNullPointerException);
    //         });
    // }
}

module.exports.CantinaScraper = CantinaScraper;
