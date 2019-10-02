
class Study {
    constructor(conversationReference, cantina) {
        this.conversationRef = conversationReference;
        this.likesMeet = false;
        this.isVegetarian = false;
        this.isVegan = false;
        this.notWantedMeets = []; // TODO: Should later be renamed to labels.
        this.allergies = [];
        this.supplements = [];
        this.cantina = cantina;
    }
}

module.exports.Study = Study;
