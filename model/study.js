let disclaimer = '';

class Study {
    // eslint-disable-next-line no-useless-constructor
    constructor(conversationReference) {
        this.conversationRef = conversationReference;
    }

    start() {

    }

    end() {

    }

    get disclaimer() {
        return disclaimer;
    }

    set disclaimer(content) {
        disclaimer = content;
    }
}

module.exports.Study = Study;
