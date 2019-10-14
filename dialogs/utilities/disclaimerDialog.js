const { WaterfallDialog, ComponentDialog, ChoicePrompt, ChoiceFactory, ListStyle } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory } = require('botbuilder');

const { JsonOps } = require('../../utilities/jsonOps');
const { StudyDialog } = require('../study/studyDialog');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const STUDY_DIALOG = 'studyDialog';

const DISCLAIMER = 'disclaimer';
const DISCLAIMER_DIALOG = 'disclaimerDialog';
const DISCLAIMER_PROMPT = 'disclaimerPrompt';

const DISCLAIMER_PROMPT_TEXT = 'Ich muss dir noch mitteilen, dass im Rahmen' +
    ' einer Abschlussarbeit die Eingaben die du in diesem Chat tätigst' +
    ' aufgezeichnet und ausgewertet werden. Diese Daten können und werden' +
    ' nicht mit dir in Verbindung gebracht und annonym gespeichert.\n\n' +
    'Bist du mit diesen Bedingungen einverstanden?';

const USER_DECLINED_TEXT = 'Aller klar, allerdings kann ich dir nun leider' +
    ' nicht das passende Gericht heraussuchen. Du kannst mich aber' +
    ' nach dem heutigen Menü fragen oder eine' +
    ' Wochenübersicht durchblättern. Über das Stichwort **hilfe** kann ich' +
    ' dir zeigen, was du mich generell Fragen kannst. Falls' +
    ' du deine Meinung änderst, schreibe mir' +
    ' einfach **"Finde mein Gericht"**.';

// TODO: Why so complicated?
const disclaimerChoices = ['Nein', 'Ja'];
const CHOICE = {
    YES: 1,
    NO: 0
};

class DisclaimerDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || DISCLAIMER_DIALOG);
        this.luisRecognizer = luisRecognizer;
        this.addDialog(new ChoicePrompt(DISCLAIMER_PROMPT));
        this.addDialog(new StudyDialog(STUDY_DIALOG, this.luisRecognizer));
        this.addDialog(new WaterfallDialog(DISCLAIMER,
            [
                this.promptDisclaimer.bind(this),
                this.analyseReply.bind(this)
            ]));
        this.initialDialogId = DISCLAIMER;
    }

    async promptDisclaimer(step) {
        console.log('[DiscalimerDialog]: prompt for disclaimer');
        return await step.prompt(DISCLAIMER_PROMPT, {
            prompt: MessageFactory.text(DISCLAIMER_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(disclaimerChoices),
            style: ListStyle.suggestedAction
        });
    }

    async analyseReply(step) {
        const choice = step.result.value;
        if (disclaimerChoices[CHOICE.YES] === choice) {
            // TODO: Should be done only once.
            const CONTACTS = MessageFactory
                .attachment(CardFactory
                    .adaptiveCard(await JsonOps.prototype
                        .loadFrom('utilities', 'disclaimer')));
            await step.context.sendActivity(CONTACTS);
            return await step.replaceDialog(STUDY_DIALOG);
        } else {
            await step.context.sendActivity(MessageFactory
                .text(USER_DECLINED_TEXT));
            return await step.endDialog();
        }
    }
}
module.exports.DisclaimerDialog = DisclaimerDialog;
