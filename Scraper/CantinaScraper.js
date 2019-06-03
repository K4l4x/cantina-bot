const _promise = require('request-promise-native'); // using native, because only basic functionality is needed.
const _cheerio = require('cheerio');
const mensaXmenuURI = 'http://www.studierendenwerk-bielefeld.de/essen-trinken/essen-und-trinken-in-mensen/bielefeld/mensa-gebaeude-x.html';

const options = {
    uri: mensaXmenuURI,
    transform: function(body) {
        return _cheerio.load(body);
    },
    json: true
};

class CantinaScraper {
    /**
     *
     * @returns {Promise<T>}
     */
    async requestDateTime() {
        return await _promise(options)
            .then(function($) {
                const rawDates = [];

                // Extracting weekdays and dates. Also remove all spaces, before adding to raw array.
                $('#c1367').find('h2').each(function(index, item) {
                    rawDates[index] = $(item).text().replace(/\s+/g, '');
                });

                return rawDates;
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
    /**
     *
     * @returns {Promise<T>}
     */
    async requestCountMenusPerDay() {
        return await _promise(options)
            .then(function($) {
                const rawOddsCounts = [];
                const rawEvenCounts = [];

                $('.stripedtable').each(function(index, item) {
                    rawOddsCounts[index] = $(item).find('.odd').get().length;
                    rawEvenCounts[index] = $(item).find('.even').get().length;
                });

                return rawOddsCounts.map(function(elem, index) {
                    return parseInt(elem + rawEvenCounts[index]);
                });
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
    /**
     *
     * @returns {Promise<T>}
     */
    async requestPricesPerDay() {
        return await _promise(options)
            .then(function($) {
                const rawPrices = [];

                $('.stripedtable').find('td[width="150px"]').each(function(index, item) {
                    rawPrices[index] = $(item).text().replace(/\s+/gm, ' ');
                });

                return rawPrices;
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
        return await _promise(options)
            .then(function($) {
                const rawTypes = [];

                $('.stripedtable').find('h3').each(function(index, item) {
                    rawTypes[index] = $(item).text().replace(/\s+/gm, ' ');
                });

                return rawTypes;
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
        return await _promise(options)
            .then(function($) {
                const rawMenus = [];

                $('.stripedtable').find('.first').not(':empty').each(function(index, item) {
                    rawMenus[index] = $(item).find('p').not('.menu-detail').text().replace(/\s+/gm, ' ');
                });

                return rawMenus;
            })
            .catch(function(PossibleNullPointerException) {
                console.log(PossibleNullPointerException);
            });
    }
}

// Sample of "prototype" in ex. request.toConsole();
// CantinaScraper.prototype.toConsole = function() {
//     let output = this;
//     console.log(output);
// };

exports.CantinaScraper = CantinaScraper;
