const { MessageFactory } = require('botbuilder');
const { WaterfallDialog, ChoicePrompt, ChoiceFactory, ListStyle, TextPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const QUESTIONNAIRE_DIALOG = 'questionnaireDialog';
const QUESTIONNAIRE = 'questionnaire';

// TODO: Currently not the final questions.
// Question prompts.
const FIRST_PROMPT = 'firstQuestionPrompt';
const FIRST_PROMPT_TEXT = 'Wie empfandest du den Dialog mit CantinaBot?';
const SECOND_PROMPT = 'secondQuestionPrompt';
const SECOND_PROMPT_TEXT = 'Hat CantinaBot immer ein passendes Gericht für' +
    ' dich ausgesucht?';
const THIRD_PROMPT = 'thirdQuestionPrompt';
const THIRD_PROMPT_TEXT = 'Wusstest du in jeder Situation, was du CantinaBot' +
    ' schreiben konntest?';
const FOURTH_PROMPT = 'fourthQuestionPrompt';
const FOURTH_PROMPT_TEXT = 'Wie informierst du dich sonst über das Angebot' +
    ' der Mensa?';
const FIFTH_PROMPT = 'fifthQuestionPrompt';
const FIFTH_PROMPT_TEXT = 'Fragen und Antworten, die während des Interviews' +
    ' entstanden sind?';

const USER_CHOICES = ['Ja', 'Nein'];

// TODO: Look into the lecture of "human computer interaction".
// TODO: Write own CancelAndHelpDialog?
class QuestionnaireDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || QUESTIONNAIRE_DIALOG);
        this.addDialog(new ChoicePrompt(FIRST_PROMPT));
        this.addDialog(new ChoicePrompt(SECOND_PROMPT));
        this.addDialog(new ChoicePrompt(THIRD_PROMPT));
        this.addDialog(new ChoicePrompt(FOURTH_PROMPT));
        this.addDialog(new TextPrompt(FIFTH_PROMPT));
        this.addDialog(new WaterfallDialog(QUESTIONNAIRE,
            [
                this.prepareQuestionnaire.bind(this),
                this.startQuestionnaire.bind(this),
                this.firstQuestion.bind(this),
                this.secondQuestion.bind(this),
                this.thirdQuestion.bind(this),
                this.fourthQuestion.bind(this),
                this.fifthQuestion.bind(this),
                this.endQuestionnaire.bind(this),
                this.resultQuestionnaire.bind(this)
            ]));
        this.initialDialogId = QUESTIONNAIRE;
    }

    async prepareQuestionnaire(step) {
        return step.next();
    }

    async startQuestionnaire(step) {
        return step.next();
    }

    // FIXME: Currently not the final question.
    async firstQuestion(step) {
        return await step.prompt(FIRST_PROMPT, {
            prompt: MessageFactory.text(FIRST_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    // FIXME: Currently not the final question.
    async secondQuestion(step) {
        return await step.prompt(SECOND_PROMPT, {
            prompt: MessageFactory.text(SECOND_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    // FIXME: Currently not the final question.
    async thirdQuestion(step) {
        return await step.prompt(THIRD_PROMPT, {
            prompt: MessageFactory.text(THIRD_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    // FIXME: Currently not the final question.
    async fourthQuestion(step) {
        return await step.prompt(FOURTH_PROMPT, {
            prompt: MessageFactory.text(FOURTH_PROMPT_TEXT),
            choices: ChoiceFactory.toChoices(USER_CHOICES),
            style: ListStyle.suggestedAction
        });
    }

    // FIXME: Currently not the final question.
    async fifthQuestion(step) {
        return await step.prompt(FIFTH_PROMPT, {
            prompt: MessageFactory.text(FIFTH_PROMPT_TEXT)
        });
    }

    async endQuestionnaire(step) {
        return step.next();
    }

    async resultQuestionnaire(step) {
        return await step.endDialog();
    }
}

module.exports.QuestionnaireDialog = QuestionnaireDialog;
