const { CardSchemaCreator } = require('./cardSchemaCreator');

let questionnaire = null;

class Study {
    // eslint-disable-next-line no-useless-constructor
    constructor(conversationReference) {
        this.conversationRef = conversationReference;
    }

    start() {
        this.questionnaire();
    }

    end() {

    }

    get questionnaire() {
        return questionnaire;
    }

    async loadQuestionnaire(name) {
        Object.assign(this, await CardSchemaCreator.prototype
            .loadFromJSON('questionnaire', name));
    }
}

module.exports.Study = Study;
