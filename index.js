// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { DialogSet, DialogTurnStatus} = require('botbuilder-dialogs');
const { CantinaRequestsRecognizer } = require('./utilities/CantinaRequestsRecognizer');
const { BlobStorage } = require('botbuilder-azure');

const { Cantina } = require('./model/cantina');
const { TodaysMenuDialog } = require('./dialogs/cantina/todaysMenuDialog');

// This bot's main routine and rootDialog.
const { CantinaBot } = require('./bot');
const { RootDialog } = require('./dialogs/rootDialog');

// Read .env file for configuration
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// If configured, pass in the recognizer.  (Defining it externally allows it
// to be mocked for tests)
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = { applicationId: LuisAppId, endpointKey: LuisAPIKey, endpoint: `https://${ LuisAPIHostName }` };

// Create cantina request recognizer.
const luisRecognizer = new CantinaRequestsRecognizer(luisConfig);

// Define state store (In-Memory) for your bot.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
// const cantinaState = new ConversationState(memoryStorage);
// const conversationState = new ConversationState(memoryStorage);
// const userState = new UserState(memoryStorage);

// Define state store (Blob) for bot.
const blobStorage = new BlobStorage({
    containerName: process.env.Container,
    storageAccessKey: process.env.StorageKey,
    storageAccountOrConnectionString: process.env.ConnectionString
});

// Create conversation and user state with blob storage provider.
const cantinaState = new ConversationState(memoryStorage);
const conversationState = new ConversationState(blobStorage);
const userState = new UserState(blobStorage);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Create HTTP server
const server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, () => {
server.listen(process.env.port || process.env.PORT || 3000, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open CantinaBot.bot file in the Emulator');
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity('Leider ist da etwas total schiefgelaufen.');
};
// Create conversation references object.
const conversationReferences = {};

// Create the main dialog.
const dialog = new RootDialog(cantinaState, conversationState, userState, luisRecognizer);
const cantinaBot = new CantinaBot(cantinaState, conversationState, userState, dialog, conversationReferences);

// Heart of the system.
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        // Route to main dialog.
        await cantinaBot.run(turnContext);
    });
});

// Listen for incoming trigger and start proactive dialog with user.
// server.get('/api/questionnaire', async (require, res) => {
//     for (const conversationReference of Object.values(conversationReferences)) {
//         await adapter.continueConversation(conversationReference, async turnContext => {
//             // await cantinaBot.run(turnContext);
//             await turnContext.sendActivity('proactive trigger');
//         });
//     }
//
//     res.setHeader('Content-Type', 'text/html');
//     res.writeHead(200);
//     res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
//     res.end();
// });

// TODO: This works! Currently sending proactively the menu of today. Also
//  on azure there is no need to add another endpoint, because posts on
//  stackoverflow say, that we can just add endpoints.
// Listen for incoming trigger and start proactive dialog with user.
// server.get('/api/questionnaire5645', async (require, res) => {
//     for (const conversationReference of Object.values(conversationReferences)) {
//         await adapter.continueConversation(conversationReference, async turnContext => {
//             const questionnaireAccessor = conversationState.createProperty('QuestionnaireState');
//
//             const dialogSet = new DialogSet(questionnaireAccessor);
//             dialogSet.add(new TodaysMenuDialog('todaysMenuDialog'));
//
//             const dialogContext = await dialogSet.createContext(turnContext);
//             const results = await dialogContext.continueDialog();
//             if (results.status === DialogTurnStatus.empty) {
//                 const cantina = new Cantina('mensaX');
//                 await cantina.menu.loadList();
//                 await dialogContext.beginDialog('todaysMenuDialog', cantina);
//             }
//         });
//     }
//
//     res.setHeader('Content-Type', 'text/html');
//     res.writeHead(200);
//     res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
//     res.end();
// });

// try
// {
//     var conversationStateAccessors = _ConversationState.CreateProperty<DialogState>(nameof(DialogState));
//
//     var dialogSet = new DialogSet(conversationStateAccessors);
//     dialogSet.Add(this._Dialog);
//
//     var dialogContext = await dialogSet.CreateContextAsync(turnContext, cancellationToken);
//     var results = await dialogContext.ContinueDialogAsync(cancellationToken);
//     if (results.Status == DialogTurnStatus.Empty)
//     {
//         await dialogContext.BeginDialogAsync(_Dialog.Id, null, cancellationToken);
//         await _ConversationState.SaveChangesAsync(dialogContext.Context, false, cancellationToken);
//     }
//     else
//         await turnContext.SendActivityAsync("Starting proactive message bot call back");
// }
// catch (Exception ex)
// {
//     this._Logger.LogError(ex.Message);
// }
