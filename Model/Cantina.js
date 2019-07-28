/**
 * Represents a general cantina.
 */

var openingHours;

class Cantina {
    constructor(name, hours) {
        this.name = name;
        this.setOpeningHours(hours);
    }

    // TODO: Get hours from website of cantina and fill openingHours.
    setOpeningHours(hours) {
        openingHours = {
            monday: '11:30 - 14:30Uhr',
            tuesday: '11:30 - 14:30Uhr',
            wednesday: '11:30 - 14:30Uhr',
            thursday: '11:30 - 14:30Uhr',
            friday: '11:30 - 14:30Uhr'
        };
    }

    getOpeningHours() {
        return openingHours;
    }
}

module.exports.Cantina = Cantina;
