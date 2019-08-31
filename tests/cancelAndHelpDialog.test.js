/* eslint-env node, mocha */
const { MessageFactory } = require('botbuilder');
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../dialogs/utilities/cancelAndHelpDialog');
const { describe } = require('mocha');
const assert = require('assert');

class TestCancelAndHelpDialog extends CancelAndHelpDialog {
    constructor() {
        super('TestCancelAndHelpDialog');

        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new WaterfallDialog('WaterfallDialog', [
                this.promptStep.bind(this),
                this.finalStep.bind(this)
            ]));
        this.initialDialogId = 'WaterfallDialog';
    }

    async promptStep(step) {
        return await step.prompt('TextPrompt', {
            prompt: MessageFactory.text('Hi there')
        });
    }

    async finalStep(step) {
        return await step.endDialog();
    }
}

describe('CancelAndHelpDialog', () => {
    describe('Should be able to cancel', () => {
        const testCases = ['abbrechen', 'stopp'];

        testCases.map(testData => {
            it(testData, async () => {
                const sut = new TestCancelAndHelpDialog();
                const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

                // Execute the test case
                let reply = await client.sendActivity('Hi');
                assert.strictEqual(reply.text, 'Hi there');
                assert.strictEqual(client.dialogTurnResult.status, 'waiting');

                reply = await client.sendActivity(testData);
                assert.strictEqual(reply.text, 'Okay, ich stoppe...');
                assert.strictEqual(client.dialogTurnResult.status, 'complete');
            });
        });
    });
});
