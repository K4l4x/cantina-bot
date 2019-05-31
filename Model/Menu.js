/**
 * Represents an entire menu.
 * The description holds all parts of the dish served.
 */
class Menu {
    constructor(date, day, menuType, description, allergenic) {
        this.date = date;
        this.day = day;
        this.menuType = menuType;
        this.description = description;
        this.allergenic = allergenic;
        // this.ingredients = ingredients;
        // this.price = price;
        // this.isVegan = isVegan;
    }
}

exports.Menu = Menu;
