/**
 * A simple conversation log, to gather everthing needed for evaluations.
 */
class ConversationLog {
    constructor(Id, userId, transcript) {
        this.Id = Id;
        this.userId = userId;
        this.transcript = transcript;
    }
}

module.exports.ConversationLog = ConversationLog;
