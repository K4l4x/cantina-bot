//
// var Description = '';
// // Ingredients
// var CostForStudent = 0;
// var CostForGuest = 0;
// var CostForEmployee = 0;
// var IsVegan = false;
// var IsVeggie = false;

class Item {
    constructor(name) {
        let _name = name;

        this.getName = function() {
            return _name;
        };
    }
}

exports.Item = Item;
