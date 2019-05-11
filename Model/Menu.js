// item, List<item>
// operations on menu like AddItem, DeleteItem, SortItems, MoveItem, SearchForItem

class Menu {
    constructor(day) {
        this.items = [];

        this.day = day;
    }

    set setDay(dayName) {
        this.day = dayName;
    }

    get getDay() {
        return this.day;
    }

    addItem(item) {
        this.items.push(item);
    }

    showItems() {
        return this.items;
    }
}

exports.modules.Menu = Menu;
