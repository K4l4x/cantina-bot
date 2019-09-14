/**
 * Represents an entire menu.
 * The description holds all parts of the dish served.
 * @param date represents a date in javascript format with time at the end.
 * @param day represents a weekday in numbers e.g. Monday = 1, Tuesday = 2, ..., Friday = 5.
 */
class Menu {
    constructor(date, day, type, prices, description, allergenic, additionalInfo) {
        this.date = date;
        this.day = day;
        this.type = type;
        this.prices = prices;
        this.description = description;
        // this.allergenic = allergenic;
        // this.additionalInfo = additionalInfo;
        // this.ingredients = ingredients;
        // this.price = price;
        // this.isVegan = isVegan;
    }
}

module.exports.Menu = Menu;
