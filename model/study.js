
class Study {
    constructor(conversationReference, cantina) {
        this.conversationRef = conversationReference;
        this.likesMeet = false;
        this.isVegetarian = false;
        this.isVegan = false;
        this.notWantedMeets = [];
        this.allergies = [];
        this.other = [];
        this.cantina = cantina;
    }
}

module.exports.Study = Study;
