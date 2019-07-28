const { MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const { Cantina } = require('../Model/Cantina');
// const { User } = require('../Model/User');
const { WelcomeDialog } = require('./WelcomeDialog');
const { TodaysMenuDialog } = require('./Cantina/TodaysMenuDialog');
const { WeekMenuDialog } = require('./Cantina/WeekMenuDialog');
const { OpeningHoursDialog } = require('./Cantina/OpeningHoursDialog');

const CONVERSATION_STATE_PROPERTY = 'conversationStatePropertyAccessor';
// const USER_STATE_PROPERTY = 'userStatePropertyAccessor';

const ROOT_DIALOG = 'rootDialog';
const ROOT_WATERFALL = 'rootWaterfall';

const WELCOME_DIALOG = 'welcomeDialog';
const TODAYS_MENU_DIALOG = 'todaysMenuDialog';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';
const WEEK_MENU_DIALOG = 'weekMenuDialog';

class RootDialog extends ComponentDialog {
    constructor(conversationState, userState) {
        super(ROOT_DIALOG);

        if (!conversationState) throw new Error('[RootDialog]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[RootDialog]: Missing parameter. userState is required');

        // Create our state property accessors.
        this.cantinaProfile = conversationState.createProperty(CONVERSATION_STATE_PROPERTY);
        // this.userProfile = userState.createProperty(USER_STATE_PROPERTY);

        this.addDialog(new WelcomeDialog(WELCOME_DIALOG));
        this.addDialog(new TodaysMenuDialog(TODAYS_MENU_DIALOG));
        this.addDialog(new WeekMenuDialog(WEEK_MENU_DIALOG));
        this.addDialog(new OpeningHoursDialog(OPENING_HOURS_DIALOG));
        this.addDialog(new WaterfallDialog(ROOT_WATERFALL, [
            this.action.bind(this),
            this.result.bind(this)
        ]));
        this.initialDialogId = ROOT_WATERFALL;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
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

    async action(step) {
        const message = step.context.activity.text.toLowerCase();
        let dialogId = '';

        const cantinaProfile = await this.cantinaProfile.get(step.context, new Cantina('MensaX'));

        switch (message) {
        case '/start':
        case 'hi':
        case 'hallo':
        case 'moin':
            // dialogId = WELCOME_DIALOG;
            break;
        case 'heute':
            dialogId = TODAYS_MENU_DIALOG;
            break;
        case 'öffnungszeiten':
            dialogId = OPENING_HOURS_DIALOG;
            break;
        default:
            const didntUnderstandMessage = 'Entschuldigung, leider weiß' +
                ' nicht was du mit ' + '**\'' + message + '\'**' + ' meinst.';
            await step.context.sendActivity(MessageFactory.text(didntUnderstandMessage));
        }

        if (dialogId !== '') {
            return await step.beginDialog(dialogId, cantinaProfile);
        } else {
            return await step.next();
        }
    }

    async result(step) {
        // Returns no result, because there is no parent dialog to resume from.
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
