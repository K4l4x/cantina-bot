// Framework imports.
const { MessageFactory } = require('botbuilder');
const { DialogSet, DialogTurnStatus, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

// Model imports.
const { Cantina } = require('../model/cantina');
const { Study } = require('../model/study');

// Dialog Imports.
const { WelcomeDialog } = require('./utilities/welcomeDialog');
const { TodaysMenuDialog } = require('./cantina/todaysMenuDialog');
const { WeekMenuDialog } = require('./cantina/weekMenuDialog');
const { OpeningHoursDialog } = require('./cantina/openingHoursDialog');
const { ContactDialog } = require('./utilities/contactDialog');
const { DisclaimerDialog } = require('./utilities/disclaimerDialog');
const { MatchingDishDialog } = require('./study/matchingDishDialog');

// Setting up accessors.
const CONVERSATION_STATE_PROPERTY = 'conversationStatePropertyAccessor';
const CANTINA_STATE_PROPERTY = 'cantinaStatePropertyAccessor';
const STUDY_STATE_PROPERTY = 'studyStatePropertyAccessor';

// Setting id's for this dialog.
const ROOT_DIALOG = 'rootDialog';
const ROOT_WATERFALL = 'rootWaterfall';

// Setting id's for all needed dialogs.
const WELCOME_DIALOG = 'welcomeDialog';
const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const WEEK_MENU_DIALOG = 'weekMenuDialog';
const CONTACT_DIALOG = 'contactDialog';
const DISCLAIMER_DIALOG = 'disclaimerDialog';
const MATCHING_DISH_DIALOG = 'matchingDishDialog';

// Reply if the user has not used the CantinaDialogs yet.
const WHATS_FOR_ME_FAILED = 'Du hast leider noch keine Preferenzen gesetzt.' +
    ' Mit **"Finde mein Gericht"** helfe ich dir ein passendes und leckeres' +
    ' Gericht zu finden und merke mir deine Präferenzen.';

// Reply help text to inform users.
const HELP_TEXT = 'Mit **"stopp"** und **"abbrechen"** kannst du mich' +
    ' jederzeit unterbrechen.\n\n' +
    'Sonst frage mich z.B.\n\n' +
    '-> "Was gibt es heute zu essen?"\n\n' +
    '-> "Was gibt es diese Woche zu essen?"\n\n' +
    '-> "Sag mir die Öffnungszeiten"\n\n\n' +
    'Mit **"Finde mein Gericht"** helfe ich dir ein passendes' +
    ' und leckeres Gericht zu finden. Falls ich dir dabei' +
    ' schon geholfen habe, kannst du das natürlich noch mal' +
    ' ändern.\n\n\n' +
    'Mit **"Ich hab hunger"** versuche ich ein passendes Gericht' +
    ' basierend auf deinen gesetzten Präferenzen zu finden.';

// If there is no dialog to cancel, simply tell that the users.
const FAILED_CANCEL = 'Gerade gibt es nichts, was ich abbrechen könnte.';

// A set of valid messages, that the bot understands.
const validMessages = {
    START: '/start',
    TODAY: 'heute',
    WEEK: 'woche',
    CONTACT: 'ansprechpartner',
    _CONTACT: 'kontakt',
    OPENINGHOURS: 'öffnungszeiten',
    FIND_DISH: 'finde mein gericht',
    HUNGER: 'hunger',
    HELP: 'hilfe',
    _HELP: '?',
    STOP: 'stop',
    CANCEL: 'abbrechen'
};

/**
 * Main dialog routine to handle every incoming message of the user, if the
 * bot and the user are not in an deeper dialog on the stack. From here
 * starting new dialogs within dialogs and handling the creating and loading
 * of the cantina.
 */
class RootDialog extends ComponentDialog {
    constructor(cantinaState, conversationState, userState, luisRecognizer) {
        super(ROOT_DIALOG);

        if (!cantinaState) {
            throw new Error('[RootDialog]: Missing parameter.' +
                ' cantinaState is required');
        }
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

        // Create our state property accessors. Because bots are stateless,
        // it is necessary to handle data I/O explicitly.
        this.cantinaProfile = cantinaState
            .createProperty(CANTINA_STATE_PROPERTY);
        this.conversationData = conversationState
            .createProperty(CONVERSATION_STATE_PROPERTY);
        this.studyProfile = userState
            .createProperty(STUDY_STATE_PROPERTY);
        this.luisRecognizer = luisRecognizer;

        // Adding all needed dialogs to the set.
        this.addDialog(new WelcomeDialog(WELCOME_DIALOG, this.luisRecognizer));
        this.addDialog(new TodaysMenuDialog(TODAYS_MENU_DIALOG));
        this.addDialog(new WeekMenuDialog(WEEK_MENU_DIALOG));
        this.addDialog(new OpeningHoursDialog(OPENING_HOURS_DIALOG));
        this.addDialog(new ContactDialog(CONTACT_DIALOG));
        this.addDialog(new DisclaimerDialog(DISCLAIMER_DIALOG, this.luisRecognizer));
        this.addDialog(new MatchingDishDialog(MATCHING_DISH_DIALOG));
        this.addDialog(new WaterfallDialog(ROOT_WATERFALL, [
            this.prepareCantina.bind(this),
            this.handleRequests.bind(this),
            this.saveResults.bind(this)
        ]));
        // To give this dialog it's own logic in form of steps, the
        // initialDialogId has to be set to the defined WaterfallDialog
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

    // FIXME: If the university website does not respond, "menu.fill()" will
    //  wait for ever. Should just load the JSON thats already there or say,
    //  that we cannot receive data because the service is down.
    /**
     * Creating a new Cantina and loading menus from resources or creating
     * new menus of the current week. This runs basically in the background
     * while the user is navigating through the dialogs.
     * @param step
     * @returns {Promise<*>} awating promise any
     */
    async prepareCantina(step) {
        console.log('[RootDialog]: prepare storage and cantina...');
        const cantina = new Cantina('mensaX');
        await this.cantinaProfile.get(step.context, cantina);
        // TODO: Check if saved menus are still valid or have to be updated.
        //       If it gets more complex, this should be done elsewhere.
        // Further more:
        // Loading menus from storage/file, checking if new menus are available,
        // if so, prepare new menus and save them to storage/file. If not
        // just load menus from storage/file.

        // Menu not empty => look up, if empty or if not latest, fill up.
        if (cantina.menu.length !== 0) {
            if (await cantina.menu.isLatest()) {
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
            console.log('[RootDialog]: cantina menu object empty -> filling' +
                ' up');
            await cantina.menu.save();
        }

        return await step.next(cantina);
    }

    /**
     * Handling all main user requets and route them to the right dialog.
     * @param step
     * @returns {Promise<*>} awating promise any
     */
    async handleRequests(step) {
        console.log('[RootDialog]: handle user requests...');
        let dialogId = '';
        let options = {};
        const cantina = step.result;
        const study = await this.studyProfile.get(step.context, new Study());

        // Get saved conversation data. If null, create with
        // promptedCantina default value false;
        const conversationData = await this.conversationData
            .get(step.context, { promptedStudy: false });

        // Converting every incoming message toLowerCase, makeing it more
        // easier to handle.
        const message = step.context.activity.text.toLowerCase();

        // Setting dialog id's to wished dialog, so not pollouting the if-else.
        if (message.includes(validMessages.START) &&
            conversationData.promptedStudy === false) {
            console.log('[RootDialog]: user first contact');
            dialogId = WELCOME_DIALOG;
        } else if (message.includes(validMessages.FIND_DISH)) {
            dialogId = DISCLAIMER_DIALOG;
        } else if (message.includes(validMessages.HUNGER)) {
            if (conversationData.promptedStudy === true) {
                dialogId = MATCHING_DISH_DIALOG;
                options = study;
            } else {
                await step.context
                    .sendActivity(MessageFactory.text(WHATS_FOR_ME_FAILED));
            }
        } else if (message.includes(validMessages.TODAY)) {
            dialogId = TODAYS_MENU_DIALOG;
            options = cantina;
        } else if (message.includes(validMessages.WEEK)) {
            dialogId = WEEK_MENU_DIALOG;
            options = cantina;
        } else if (
            message.includes(validMessages.CONTACT) ||
            message.includes(validMessages._CONTACT)) {
            dialogId = CONTACT_DIALOG;
        } else if (message.includes(validMessages.OPENINGHOURS)) {
            dialogId = OPENING_HOURS_DIALOG;
            options = cantina;
        } else if (
            message.includes(validMessages.HELP) ||
            message.includes(validMessages._HELP)) {
            await step.context.sendActivity(MessageFactory.text(HELP_TEXT));
        } else if (
            message.includes(validMessages.STOP) ||
            message.includes(validMessages.CANCEL)) {
            await step.context.sendActivity(MessageFactory.text(FAILED_CANCEL));
        } else {
            await step.context.sendActivity(MessageFactory.text(
                'Entschuldigung, leider weiß ich nicht was du ' +
                'mit ' + '**"' + message + '"**' + ' meinst. Mit dem' +
                ' Stichwort **"hilfe"** kann ich' +
                ' dir zeigen, was du mich generell Fragen kannst.'));
        }

        // No dialogId, nothing to do.
        if (dialogId !== '') {
            return await step.beginDialog(dialogId, options);
        } else {
            return await step.next();
        }
    }

    /**
     * Handels results of each dialog that has been started. If their exists
     * a result, than this result is definetly user data, that has to be saved.
     * @param step
     * @returns {Promise<DialogTurnResult<any>|void>} await DialogTurnResult
     * to return user data to save changes.
     */
    async saveResults(step) {
        if (typeof step.result !== 'undefined') {
            // Set promptedCantina true, to deactivate WelcomeDialog option.
            await this.conversationData.set(step.context, { promptedStudy: true });
            // Save new user input.
            const study = new Study();
            Object.assign(study, step.result);
            await this.studyProfile.set(step.context, study);
        }

        // No need to return something, already set the data to be saveable.
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
