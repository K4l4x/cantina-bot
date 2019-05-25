const _promise = require('request-promise-native'); // using native, because only basic functionality is needed.
const _cheerio = require('cheerio');
const system = require('fs');

const mensaXmenuURI = 'http://www.studierendenwerk-bielefeld.de/essen-trinken/essen-und-trinken-in-mensen/bielefeld/mensa-gebaeude-x.html';

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
                console.log(weekDays);
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
    /**
     *
     * @returns {Promise<T>}
     */
    async requestMenuTypes() {
        options.transform = this.extractTypeOfMenuToJson;

        return await _promise(options)
            .then(function(menuTypes) {
                // system.appendFile('MenuPart.json', menuTypes, function(err) {
                //     if (err) throw err;
                //     console.log('Saved to MenuPart.json');
                // });
                return menuTypes.toString();
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
    // return $('#c1367').find('.first').text();

    // Extracting week day menus.
    // const content = $('#c1367').find('.mensa').text();
    /**
     *
     * @param body
     * @returns {Promise<string>}
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
        return JSON.stringify(days);
    }
    /**
     *
     * @param body of {mensaXmenuURI}
     * @returns {Promise<string>}
     */
    async extractTypeOfMenuToJson(body) {
        const $ = _cheerio.load(body);
        const raw = [];
        const menuTypes = [];

        // Extracting all types of possible menus, while ignoring the .menu-detail and removing spaces.
        $('.mensa').find('strong').not('.menu-detail').each(function(i, elem) {
            raw[i] = $(this).text().replace(/\s+/gm, '');
        });

        // Go through every raw menu types and create a new menu based on that type.
        // Also pushing the new menus into menus.
        raw.forEach(function(elem) {
            let menu = {};
            menu.type = elem.toString();
            menuTypes.push(menu);
        });

        return JSON.stringify(menuTypes);
    }

    /**
     *
     * @param body of {mensaXmenuURI}
     * @returns {Promise<string>}
     */
    async extractMenusToJson(body) {
        const $ = _cheerio.load(body);
        const raw = [];
        const menus = [];

        $('.mensa').find('.first').not('.menu-detail').each(function(i, elem) {
            raw[i] = $(this).find('p').not('h3').text().replace(/\s+/gm, ' ');
        });

        raw.forEach(function(elem) {
            let descriptionMess = elem.toString();
            let infoTextString = 'Es können 3 Wahlbeilagen gewählt werden:';
            let showDetailsString = 'Details anzeigen';

            descriptionMess = descriptionMess.replace(new RegExp(infoTextString), '|');

            let sideDishes = descriptionMess.substring(
                descriptionMess.lastIndexOf('|') + 1,
                descriptionMess.lastIndexOf('Details anzeigen')
            );

            descriptionMess = descriptionMess.replace(new RegExp(sideDishes), ' ');

            let finalDescription = descriptionMess.replace(new RegExp(showDetailsString), ' ');

            let menu = {};
            menu.InfoText = infoTextString;
            menu.description = finalDescription;
            menu.sideDishes = sideDishes;
            menus.push(menu);
        });

        return JSON.stringify(menus);
    }
}

// Sample of "prototype" in ex. request.toConsole();
// MenuScraper.prototype.toConsole = function() {
//     let output = this;
//     console.log(output);
// };

exports.MenuScraper = MenuScraper;
