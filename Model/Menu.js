/**
 * Represents an entire menu.
 * The description holds all parts of the dish served.
 */
class Menu {
    constructor(title, type, description, ingredients, price, menuInfo, day, isVegan) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.ingredients = ingredients;
        this.price = price;
        this.menuInfo = menuInfo;
        this.day = day;
        this.isVegan = isVegan;
    }
}

exports.modules.Menu = Menu;
