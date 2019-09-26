const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { JsonOps } = require('../../utilities/jsonOps');

const CONTACT_DIALOG = 'contactDialog';
const CONTACT = 'contact';

class ContactDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || CONTACT_DIALOG);
        this.addDialog(new WaterfallDialog(CONTACT,
            [
                this.showContacts.bind(this)
            ]));
        this.initialDialogId = CONTACT;
    }

    async showContacts(step) {
        const attachments = [];
        const contactCard = await JsonOps.prototype
            .loadFrom('utilities', 'contacts');

        attachments.push(CardFactory.adaptiveCard(contactCard));
        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog();
    }
}

module.exports.ContactDialog = ContactDialog;
