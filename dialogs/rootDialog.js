const { MessageFactory } = require('botbuilder');
const { DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./utilities/cancelAndHelpDialog');
const { Cantina } = require('../model/cantina');
const { Study } = require('../model/study');

const { WelcomeDialog } = require('./utilities/welcomeDialog');
const { TodaysMenuDialog } = require('./cantina/todaysMenuDialog');
const { WeekMenuDialog } = require('./cantina/weekMenuDialog');
const { OpeningHoursDialog } = require('./cantina/openingHoursDialog');
const { DisclaimerDialog } = require('./utilities/disclaimerDialog');

const CONVERSATION_STATE_PROPERTY = 'conversationStatePropertyAccessor';
const STUDY_STATE_PROPERTY = 'studyStatePropertyAccessor';
// const USER_STATE_PROPERTY = 'userStatePropertyAccessor';

const ROOT_DIALOG = 'rootDialog';
const ROOT_WATERFALL = 'rootWaterfall';

const WELCOME_DIALOG = 'welcomeDialog';
const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const WEEK_MENU_DIALOG = 'weekMenuDialog';
const DISCLAIMER_DIALOG = 'disclaimerDialog';

const cant = new Cantina('mensaX');

class RootDialog extends CancelAndHelpDialog {
    constructor(conversationState, userState) {
        super(ROOT_DIALOG);

        if (!conversationState) {
            throw new Error('[RootDialog]: Missing parameter.' +
            ' conversationState is required');
        }
        if (!userState) {
            throw new Error('[RootDialog]: Missing parameter.' +
            ' userState is required');
        }

        // Create our state property accessors.
        this.cantinaProfile = conversationState
            .createProperty(CONVERSATION_STATE_PROPERTY);
        this.studyProfile = conversationState
            .createProperty(STUDY_STATE_PROPERTY);
        // this.userProfile = userState.createProperty(USER_STATE_PROPERTY);

        this.addDialog(new WelcomeDialog(WELCOME_DIALOG));
        this.addDialog(new TodaysMenuDialog(TODAYS_MENU_DIALOG));
        this.addDialog(new WeekMenuDialog(WEEK_MENU_DIALOG));
        this.addDialog(new OpeningHoursDialog(OPENING_HOURS_DIALOG));
        this.addDialog(new DisclaimerDialog(DISCLAIMER_DIALOG));
        this.addDialog(new WaterfallDialog(ROOT_WATERFALL, [
            this.prepare.bind(this),
            this.action.bind(this),
            this.result.bind(this)
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
    async prepare(step) {
        // TODO: Check if saved menus are still valid or have to be updated.
        //       If it gets more complex, this should be done elsewhere.
        // Further more:
        // Loading menus from storage/file, checking if new menus are available,
        // if so, prepare new menus and save them to storage/file. If not
        // just load menus from storage/file.
        // const today = moment(Date.now()).format('LL');

        // // Test for weekends SATURDAY -> THURSDAY; SUNDAY -> WEDNESDAY.
        // const today = moment(Date.now()).subtract(4,
        //     'days').format('LL');

        // let menus = await CardSchemaCreator.prototype
        //     .loadFromJSON('mensaX', 'menus');
        //
        // if (menus === null || menus.length === 0) {
        //     const builder = new MenuBuilder();
        //     menus = await builder.buildMenus();
        //     // menus = menus.map(n =>
        //     // CardSchemaCreator.prototype.createMenuCard(n));
        //     await CardSchemaCreator.prototype
        //         .saveAsJSON('mensaX', 'menus', menus);
        // }

        if (cant.menuList === null || cant.menuList.length === 0) {
            await cant.menuList.fill();
            await cant.menuList.save();

            this.cantinaProfile = await this.cantinaProfile
                .get(step.context, cant);
        }

        return await step.next(this.cantinaProfile);
    }

    /**
     * Just handle incoming messages and begin new dialogs from here.
     * @param step
     * @returns {Promise<*>}
     */
    async action(step) {
        const cantinaProfile = Object.assign(new Cantina(), step.result);
        const message = step.context.activity.text.toLowerCase();
        let dialogId = '';
        let options = {};

        switch (message) {
        case '/start':
        case 'hi':
        case 'hallo':
        case 'moin':
            dialogId = WELCOME_DIALOG;
            options = cantinaProfile;
            break;
        case 'heute':
            dialogId = TODAYS_MENU_DIALOG;
            options = cantinaProfile;
            break;
        case 'woche':
            dialogId = WEEK_MENU_DIALOG;
            options = cantinaProfile;
            break;
        case 'öffnungszeiten':
            dialogId = OPENING_HOURS_DIALOG;
            options = cantinaProfile;
            break;
        case 'disclaimer':
            dialogId = DISCLAIMER_DIALOG;
            options = await this.studyProfile
                .get(step.context, new Study());
            break;
        default:
            await step.context.sendActivity(MessageFactory.text('Entschuldiging, leider' +
                ' weiß ich nicht was du mit ' + '**\'' + message + '\'**' + ' meinst.'));
        }

        if (dialogId !== '') {
            return await step.beginDialog(dialogId, options);
        } else {
            return await step.next();
        }
    }

    /**
     * Handling results from the ended dialogs.
     * @param step
     * @returns {Promise<*>}
     */
    async result(step) {
        // Returns no result, because there is no parent dialog to resume from.
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
