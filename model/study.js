
class Study {
    constructor(conversationReference, cantina) {
        this.likesMeet = false;
        this.isVegetarian = false;
        this.isVegan = false;
        this.notWantedMeets = [];
        this.allergies = [];
        this.supplements = [];
        this.cantina = cantina;
    }
}

module.exports.Study = Study;
