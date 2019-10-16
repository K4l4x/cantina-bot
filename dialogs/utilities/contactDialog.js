const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog } = require('botbuilder-dialogs');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const Contacts = require('../../resources/utilities/contacts');

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
        attachments.push(CardFactory.adaptiveCard(Contacts));
        await step.context.sendActivity({
            attachments: attachments,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });
        return await step.endDialog();
    }
}

module.exports.ContactDialog = ContactDialog;
