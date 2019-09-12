let disclaimer = '';
let questionair = null;

class Study {
    // eslint-disable-next-line no-useless-constructor
    constructor(conversationReference) {
        this.conversationRef = conversationReference;
    }

    start() {
        this.questionair();
    }

    end() {

    }

    get questionair() {
        return questionair;
    }

    loadQuestionair(name) {
        Object.assign(this, await CardSchemaCreator.prototype
            .loadFromJSON('questionairs', name));
    }

    get disclaimer() {
        return disclaimer;
    }

    set disclaimer(content) {
        disclaimer = content;
    }
}

module.exports.Study = Study;
