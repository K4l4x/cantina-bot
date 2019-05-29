const _promise = require('request-promise-native'); // using native, because only basic functionality is needed.
const _cheerio = require('cheerio');
const system = require('fs');
const mensaXmenuURI = 'http://www.studierendenwerk-bielefeld.de/essen-trinken/essen-und-trinken-in-mensen/bielefeld/mensa-gebaeude-x.html';
var { Menu } = require('../Model/Menu');

const options = {
    uri: mensaXmenuURI,
    json: true
};

class MenuScraper {
    /**
     *
     * @returns {Promise<T>}
     */
    async requestGeneralMenuPageToFile() {
        return await _promise(mensaXmenuURI)
            .then(function(htmlString) {
                system.appendFile('GeneralMenu.html', htmlString, function(err) {
                    if (err) throw err;
                    console.log('Saved to GeneralMenu.html');
                });
            })
            .catch(function(WriteToFileException) {
                console.log(WriteToFileException);
            });
    }

    /**
     *
     * @returns {Promise<T>}
     */
    async requestWeekDays() {
        options.transform = this.extractWeekDaysToJson;

        return await _promise(options)
            .then(function(weekDays) {
                // system.appendFile('MenuPart.json', weekDays, function(err) {
                //     if (err) throw err;
                //     console.log('Saved to MenuPart.json');
                // });
                // console.log(weekDays);
                return weekDays;
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
    /**
     *
     * @returns {Promise<T>}
     */
    async requestMenus() {
        options.transform = this.extractMenusToJson;

        return await _promise(options)
            .then(function(menus) {
                // system.appendFile('MenuPart.json', menus, function(err) {
                //     if (err) throw err;
                //     console.log('Saved to MenuPart.json');
                // });

                return menus;
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }

    /**
     *
     * @returns {Promise<T>}
     */
    async requestMenuCountPerDay() {
        options.transform = this.extractMenusPerDay;

        return await _promise(options)
            .then(function(menusCount) {
                // system.appendFile('MenuPart.json', menus, function(err) {
                //     if (err) throw err;
                //     console.log('Saved to MenuPart.json');
                // });

                return menusCount;
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
    // return $('#c1367').find('.first').text();

    // Extracting week day menus.
    // const content = $('#c1367').find('.mensa').text();
    /**
     *
     * @param body
     * @returns {Promise<number[]>}
     */
    async extractMenusPerDay(body) {
        const $ = _cheerio.load(body);
    }

    /**
     *
     * @param body
     * @returns {Promise<Array>}
     */
    async extractWeekDaysToJson(body) {
        const $ = _cheerio.load(body);

        const raw = [];
        const days = [];

        // Extracting weekdays and dates. Also remove all spaces, before adding to raw array.
        $('#c1367').find('h2').each(function(i, elem) {
            raw[i] = $(this).text().replace(/\s+/g, '');
        });

        // Go through every raw day and date combination and create a new weekday from them.
        // Also pushing the new weekdays into days.
        raw.forEach(function(elem) {
            let weekDay = {};
            weekDay.day = elem.toString().split(',')[0];
            weekDay.date = elem.toString().split(',')[1];
            days.push(weekDay);
        });

        // Return valid json days.
        return days;
    }

    /**
     *
     * @param body
     * @returns {Promise<Array>}
     */
    async extractMenusToJson(body) {
        const $ = _cheerio.load(body);
        let rawMenus = [];
        const menuDescriptions = [];
        const rawTypes = [];
        let menus = [];
        const rawSups = [];
        const rawDates = [];
        const rawOddsCounts = [];
        const rawEvenCounts = [];

        // Extracting weekdays and dates. Also remove all spaces, before adding to raw array.
        $('#c1367').find('h2').each(function(index, item) {
            rawDates[index] = $(item).text().replace(/\s+/g, '');
        });

        // Extracting all menus from each day and count them.
        $('.stripedtable').each(function(index, item) {
            rawOddsCounts[index] = $(item).find('.odd').get().length;
            rawEvenCounts[index] = $(item).find('.even').get().length;
            rawSups[index] = $(item).find('sup').text().replace(/\s+/gm, ' ');
        });

        $('.stripedtable').find('strong').each(function(index, item) {
            rawTypes[index] = $(item).text().replace(/\s+/gm, ' ');
        });

        $('.stripedtable').find('.first').not(':empty').each(function(index, item) {
            rawMenus[index] = $(item).find('p').not('.menu-detail').text().replace(/\s+/gm, ' ');
        });


        rawMenus.forEach(function(menu) {
            let descriptionMess = menu;
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

            menu = descriptionMess.replace(
                new RegExp(takeWithString), ''
            );

            menuDescriptions.push(menu);
        });

        let menusPerDay = rawOddsCounts.map(function(elem, index) {
            return parseInt(elem + rawEvenCounts[index]);
        });

        menuDescriptions.reverse();

        rawDates.forEach(function(date) {
            let numberOfMenus = menusPerDay[rawDates.indexOf(date)];
            let tmpNumber = numberOfMenus;
            while (numberOfMenus !== 0) {
                let menu = new Menu();
                menu.date = date.toString().split(',')[1];
                menu.day = date.toString().split(',')[0];
                menu.menuType = rawTypes[tmpNumber - numberOfMenus];
                menu.description = menuDescriptions.pop();
                menu.allergenic = '';
                menus.push(menu);
                numberOfMenus--;
            }
        });

        // console.log(menus);

        return menus;
    }
}

// Sample of "prototype" in ex. request.toConsole();
// MenuScraper.prototype.toConsole = function() {
//     let output = this;
//     console.log(output);
// };

exports.MenuScraper = MenuScraper;
