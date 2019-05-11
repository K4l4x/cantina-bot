// item, List<item>
// operations on menu like AddItem, DeleteItem, SortItems, MoveItem, SearchForItem

class Menu {
    constructor(title, type, description, ingredients, price, menuInfo, day) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.ingredients = ingredients;
        this.price = price;
        this.menuInfo = menuInfo;
        this.day = day;
    }
}

exports.modules.Menu = Menu;
