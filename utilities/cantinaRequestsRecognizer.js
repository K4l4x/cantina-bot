const { LuisRecognizer } = require('botbuilder-ai');

class CantinaRequestsRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            this.recognizer = new LuisRecognizer(config, {}, true);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeQuery(context) {
        return await this.recognizer.recognize(context);
    }
}

module.exports.CantinaRequestsRecognizer = CantinaRequestsRecognizer;
