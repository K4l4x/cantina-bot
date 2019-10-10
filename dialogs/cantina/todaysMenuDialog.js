const { MessageFactory, CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');
const { CardSchema } = require('../../utilities/cardSchema');

const TODAYS_MENU = 'todaysMenu';
const TODAYS_MENU_DIALOG = 'todaysMenuDialog';

const DISHES_OF_TODAY_TEXT = 'Das sind die Gerichte von heute.';
const WEEKEND_HOLIDAY_TEXT = 'Am Wochenende und an Feiertagen ist die Mensa' +
    ' geschlossen.';

class TodaysMenuDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || TODAYS_MENU_DIALOG);
        this.addDialog(new WaterfallDialog(TODAYS_MENU, [
            this.scrollTroughMenus.bind(this)
        ]));
        this.initialDialogId = TODAYS_MENU;
    }

    async scrollTroughMenus(step) {
        console.log('[TodaysMenuDialog]: prepare today\'s menu...');
        const EMPTY_MENU = 0;
        const cantina = step.options;
        const attachments = [];
        // For testing just give getDay() a weekday from 1-5.
        const todaysMenu = await cantina.menu.getDay();

        if (todaysMenu.length > EMPTY_MENU) {
            for (const dish of todaysMenu) {
                attachments.push(CardFactory
                    .adaptiveCard(await CardSchema.prototype
                        .createMenuCard(dish)));
            }
            console.log('[TodaysMenuDialog]: send today\'s menu');
            await step.context
                .sendActivity(MessageFactory.text(DISHES_OF_TODAY_TEXT));
            await step.context.sendActivity({
                attachments: attachments,
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });
        } else {
            console.log('[TodaysMenuDialog]: Empty menu => weekend / holiday');
            await step.context
                .sendActivity(MessageFactory.text(WEEKEND_HOLIDAY_TEXT));
        }

        return await step.endDialog();
    }
}

module.exports.TodaysMenuDialog = TodaysMenuDialog;
