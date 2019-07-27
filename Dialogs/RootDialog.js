const { MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

// const { WelcomeDialog } = require('./WelcomeDialog');
const { TodaysMenuDialog } = require('./TodaysMenuDialog');
const { OpeningHoursDialog } = require('./OpeningHoursDialog');

const USER_STATE_PROPERTY = 'userStatePropertyAccessor';

const ROOT_DIALOG = 'rootDialog';
const ROOT_WATERFALL = 'rootWaterfall';
// const WELCOME_DIALOG = 'welcomeDialog';
const TODAYS_MEMU_DIALOG = 'todaysMenuDialog';
const OPENING_HOURS_DIALOG = 'openingHoursDialog';

class RootDialog extends ComponentDialog {
    constructor(userState) {
        super(ROOT_DIALOG);

        // Create our state property accessors.
        this.userStateAccessor = userState.createProperty(USER_STATE_PROPERTY);

        // Record the conversation and user state management objects.
        // this.conversationState = conversationState;
        // this.userState = userState;

        this.addDialog(new TodaysMenuDialog(TODAYS_MEMU_DIALOG));
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

    async action(stepContext) {
        const message = stepContext.context.activity.text.toLowerCase();
        let dialogId = '';

        switch (message) {
        case 'heute':
            dialogId = TODAYS_MEMU_DIALOG;
            break;
        default:
            const didntUnderstandMessage = 'Entschuldigung, leider weiß' +
                ' nicht was du mit ' + '**\'' + message + '\'**' + ' meinst.';
            await stepContext.context.sendActivity(MessageFactory.text(didntUnderstandMessage));
        }

        if (dialogId !== '') {
            return await stepContext.beginDialog(dialogId);
        }
        else {
            return await stepContext.next();
        }
    }

    async result(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
