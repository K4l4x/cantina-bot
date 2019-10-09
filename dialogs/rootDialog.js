const { MessageFactory } = require('botbuilder');
const { DialogSet, DialogTurnStatus, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { Cantina } = require('../model/cantina');
const { Study } = require('../model/study');

const { WelcomeDialog } = require('./utilities/welcomeDialog');
const { TodaysMenuDialog } = require('./cantina/todaysMenuDialog');
const { WeekMenuDialog } = require('./cantina/weekMenuDialog');
const { OpeningHoursDialog } = require('./cantina/openingHoursDialog');
const { ContactDialog } = require('./utilities/contactDialog');
const { DisclaimerDialog } = require('./utilities/disclaimerDialog');
const { MatchingDishDialog } = require('./study/matchingDishDialog');

const CONVERSATION_STATE_PROPERTY = 'conversationStatePropertyAccessor';
const CANTINA_STATE_PROPERTY = 'cantinaStatePropertyAccessor';
const STUDY_STATE_PROPERTY = 'studyStatePropertyAccessor';

const ROOT_DIALOG = 'rootDialog';
const ROOT_WATERFALL = 'rootWaterfall';

const WELCOME_DIALOG = 'welcomeDialog';
const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const WEEK_MENU_DIALOG = 'weekMenuDialog';
const CONTACT_DIALOG = 'contactDialog';
const DISCLAIMER_DIALOG = 'disclaimerDialog';
const MATCHING_DISH_DIALOG = 'matchingDishDialog';

const validMessages = {
    START: '/start',
    TODAY: 'heute',
    NOW: 'jetzt',
    WEEK: 'woche',
    OPENINGHOURS: 'öffnungszeiten',
    OPEN: 'offen',
    FIND_DISH: 'finde mein gericht',
    WHATS_FOR_ME: 'was gibts',
    HELP: 'hilfe',
    _HELP: '?',
    STOP: 'stop',
    CANCEL: 'abbrechen'
};

class RootDialog extends ComponentDialog {
    constructor(conversationState, userState, luisRecognizer) {
        super(ROOT_DIALOG);

        if (!conversationState) {
            throw new Error('[RootDialog]: Missing parameter.' +
            ' conversationState is required');
        }
        if (!userState) {
            throw new Error('[RootDialog]: Missing parameter.' +
            ' userState is required');
        }
        if (!luisRecognizer) {
            throw new Error('[RootDialog]: Missing' +
                ' parameter \'luisRecognizer\' is required');
        }

        // Create our state property accessors.
        this.conversationData = conversationState
            .createProperty(CONVERSATION_STATE_PROPERTY);
        this.cantinaProfile = conversationState
            .createProperty(CANTINA_STATE_PROPERTY);
        this.studyProfile = userState
            .createProperty(STUDY_STATE_PROPERTY);
        this.luisRecognizer = luisRecognizer;

        this.addDialog(new WelcomeDialog(WELCOME_DIALOG, this.luisRecognizer));
        this.addDialog(new TodaysMenuDialog(TODAYS_MENU_DIALOG));
        this.addDialog(new WeekMenuDialog(WEEK_MENU_DIALOG));
        this.addDialog(new OpeningHoursDialog(OPENING_HOURS_DIALOG));
        this.addDialog(new ContactDialog(CONTACT_DIALOG));
        this.addDialog(new DisclaimerDialog(DISCLAIMER_DIALOG, this.luisRecognizer));
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new WaterfallDialog(ROOT_WATERFALL, [
            this.prepareStorage.bind(this),
            this.handleRequests.bind(this),
            this.analyseResults.bind(this)
        ]));
        this.initialDialogId = ROOT_WATERFALL;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext)
     * and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    // TODO: Should be transformed to use storage.
    /**
     * Preparing cantina and menus by loading from storage/file or building
     * a new kind.
     * @param step
     * @returns {Promise<*>}
     */
    async prepareStorage(step) {
        const cantina = new Cantina('mensaX');
        await this.cantinaProfile.get(step.context, cantina);
        // TODO: Check if saved menus are still valid or have to be updated.
        //       If it gets more complex, this should be done elsewhere.
        // Further more:
        // Loading menus from storage/file, checking if new menus are available,
        // if so, prepare new menus and save them to storage/file. If not
        // just load menus from storage/file.

        if (cantina.menu.length !== 0) {
            if (cantina.menu.isLatest()) {
                console.log('[RootDialog]: cantina menu is latest -> going' +
                    ' to action');
            } else {
                await cantina.menu.fill();
                console.log('[RootDialog]: cantina menu not latest -> filling' +
                    ' up');
                await cantina.menu.save();
            }
        } else {
            await cantina.menu.fill();
            console.log('[RootDialog]: cantina menu empty -> filling up');
            await cantina.menu.save();
        }

        return await step.next(cantina);
    }

    async handleRequests(step) {
        const cantina = step.result;
        const study = await this.studyProfile.get(step.context, new Study());

        const conversationData = await this.conversationData
            .get(step.context, { promptedStudy: false });

        let dialogId = '';
        let options = {};
        const message = step.context.activity.text.toLowerCase();

        if (message.includes(validMessages.START) &&
            conversationData.promptedStudy === false) {
            dialogId = WELCOME_DIALOG;
            options = study;
            await this.conversationData.set(step.context, { promptedStudy: true });
            // if (message.includes(validMessages.START)) {
            //     await step.context.sendActivity(MessageFactory
            //         .text('Hi, ich bin CantinaBot. \n\n Blättere' +
            //             ' einfach durch das Menü von heute oder eines anderen' +
            //             ' Tages der Woche.'));
        } else if (message.includes(validMessages.FIND_DISH)) {
            dialogId = DISCLAIMER_DIALOG;
            options = study;
        } else if (message.includes(validMessages.WHATS_FOR_ME) &&
            conversationData.promptedStudy === true) {
            dialogId = MATCHING_DISH_DIALOG;
            options = study;
        } else if (message.includes(validMessages.TODAY)) {
            dialogId = TODAYS_MENU_DIALOG;
            options = cantina;
        } else if (message.includes(validMessages.WEEK)) {
            dialogId = WEEK_MENU_DIALOG;
            options = cantina;
        } else if (message.includes(validMessages.OPENINGHOURS)) {
            dialogId = OPENING_HOURS_DIALOG;
            options = cantina;
        } else if (
            message.includes(validMessages.HELP) ||
            message.includes(validMessages._HELP)) {
            await step.context.sendActivity(MessageFactory.text('Mit' +
                ' **stopp** und **abbrechen** kannst du mich' +
                ' jederzeit unterbrechen.\n\n' +
                ' Sonst frage mich z.B. gerne:\n\n' +
                ' "was gibt es heute zu essen?"\n\n' +
                ' "was gibt es diese woche zu essen?"\n\n' +
                ' "sag mir die öffnungszeiten"'));
        } else if (
            message.includes(validMessages.STOP) ||
            message.includes(validMessages.CANCEL)) {
            await step.context.sendActivity(MessageFactory.text('Gerade gibt' +
                ' es nichts, was ich abbrechen könnte.'));
        } else {
            await step.context.sendActivity(MessageFactory.text(
                'Entschuldigung, leider weiß ich nicht was du ' +
                'mit ' + '**\'' + message + '\'**' + ' meinst. Frag mich' +
                ' doch z.B. **"Was gibt es diese Woche zu essen?"**.'));
        }

        if (dialogId !== '') {
            return await step.beginDialog(dialogId, options);
        } else {
            return await step.next();
        }
    }

    async analyseResults(step) {
        if (typeof step.result !== 'undefined') {
            const study = new Study();
            Object.assign(study, step.result);
            await this.studyProfile.set(step.context, study);
        }

        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
