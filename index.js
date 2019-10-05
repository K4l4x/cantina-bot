// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { CantinaRequestsRecognizer } = require('./utilities/CantinaRequestsRecognizer');
const { BlobStorage } = require('botbuilder-azure');

// This bot's main routine and rootDialog.
const { CantinaBot } = require('./bot');
const { RootDialog } = require('./dialogs/rootDialog');

// Read .env file for configuration
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// const blobStorage = new BlobStorage({
//     containerName: process.env.Container,
//     storageAccessKey: process.env.StorageKey,
//     storageAccountOrConnectionString: process.env.ConnectionString
// });

// If configured, pass in the recognizer.  (Defining it externally allows it
// to be mocked for tests)
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = { applicationId: LuisAppId, endpointKey: LuisAPIKey, endpoint: `https://${ LuisAPIHostName }` };

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Create cantina request recognizer.
const luisRecognizer = new CantinaRequestsRecognizer(luisConfig);

// Define state store (In-Memory) for your bot.
const memoryStorage = new MemoryStorage();
// Define state store (Blob) for bot.

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create conversation and user state with blob storage provider.
// const conversationState = new ConversationState(blobStorage);
// const userState = new UserState(blobStorage);

// Create HTTP server
const server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, () => {
server.listen(process.env.port || process.env.PORT || 3000, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open CantinaBot.bot file in the Emulator`);
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity('Leider ist da etwas total schiefgelaufen.');
};

// Create the main dialog.
const dialog = new RootDialog(conversationState, userState, luisRecognizer);
const cantinaBot = new CantinaBot(conversationState, userState, dialog);

// Heart of the system.
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        // Route to main dialog.
        await cantinaBot.run(turnContext);
    });
});
