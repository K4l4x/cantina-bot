/**
 * Represents an entire menu.
 * The description holds all parts of the dish served.
 * @param date represents a date in javascript format with time at the end.
 * @param day represents a weekday in numbers e.g. Monday = 1, Tuesday = 2, ..., Friday = 5.
 */
class Menu {
    constructor(date, day, menuType, description, allergenic, prices) {
        this.date = date;
        this.day = day;
        this.menuType = menuType;
        this.description = description;
        this.allergenic = allergenic;
        this.prices = prices;
        // this.ingredients = ingredients;
        // this.price = price;
        // this.isVegan = isVegan;
    }

    // async calcPrices() {
    //     if (this.prices === ' ') {
    //
    //     } else if () {
    //
    //     } else {
    //
    //     }
    // }
}

exports.Menu = Menu;
