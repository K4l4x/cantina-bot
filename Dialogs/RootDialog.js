const { MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const { Cantina } = require('../Model/Cantina');
// const { User } = require('../Model/User');
const { CardSchemaCreator } = require('../Model/CardSchemaCreator');
const { MenuBuilder } = require('../Scraper/MenuBuilder');

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
            this.prepare.bind(this),
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

    // TODO: Should be transformed to use storage,
    async prepare(step) {
        // TODO: Check if saved menus are still valid or have to be updated.
        let menus = CardSchemaCreator.prototype.loadFromJSON('MensaX', 'Menus');

        if (menus === null) {
            const builder = new MenuBuilder();
            menus = await builder.buildMenus();
            // menus = menus.map(n =>
            // CardSchemaCreator.prototype.createMenuCard(n));
            CardSchemaCreator.prototype.saveAsJSON('MensaX', 'Menus', menus);
        }

        const cantinaProfile = await this.cantinaProfile.get(step.context, new Cantina('MensaX'));
        cantinaProfile.menuList = menus;

        return await step.next(cantinaProfile);
    }

    async action(step) {
        const cantinaProfile = Object.assign(new Cantina(), step.result);
        const message = step.context.activity.text.toLowerCase();
        let dialogId = '';

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
            const didntUnderstandMessage = 'Entschuldigung, leider weiß ich' +
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
        const cantina = Object.assign(new Cantina(), step.result);

        if (cantina.name !== undefined) {
            // await this.cantinaProfile.set(step.context, cantina);
        }

        // Returns no result, because there is no parent dialog to resume from.
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;
