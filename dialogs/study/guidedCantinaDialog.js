const { WaterfallDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('../utilities/cancelAndHelpDialog');

const { Study } = require('../../model/study');

const GUIDED_CANTINA_DIALOG = 'guidedCantinaDialog';
const GUIDED = 'guided';

const userDeclines = 'nein';
const userAccepts = 'ja';
const userChoices = [userAccepts, userDeclines];

const VEGETARIAN_PROMPT = 'vegetarianPrompt';
const VEGETARIAN_PROMPT_MESSAGE = 'Bist du Vegetarier?';
const CONSIDER_VEGETARIAN_PROMPT = 'considerVegetarianPrompt';
const CONSIDER_VEGETARIAN_PROMPT_MESSAGE = 'Soll ich vegetarische Gerichte ' +
    'trotzdem berücksichtigen?';

const VEGAN_PROMPT = 'veganPrompt';
const VEGAN_PROMPT_MESSAGE = 'Bist du Veganer?';
const CONSIDER_VEGAN_PROMPT = 'considerVeganPrompt';
const CONSIDER_VEGAN_PROMPT_MESSAGE = 'Soll ich vegane Gerichte trotzdem' +
    ' berücksichtigen?';

class GuidedCantinaDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || GUIDED_CANTINA_DIALOG);
        this.addDialog(new ChoicePrompt(VEGETARIAN_PROMPT));
        this.addDialog(new ChoicePrompt(CONSIDER_VEGETARIAN_PROMPT));
        this.addDialog(new ChoicePrompt(VEGAN_PROMPT));
        this.addDialog(new ChoicePrompt(CONSIDER_VEGAN_PROMPT));
        this.addDialog(new WaterfallDialog(GUIDED,
            [
                this.prepare.bind(this),
                this.prepareVegetarian.bind(this),
                this.vegetarianCheck.bind(this),
                this.considerVegetarianDishes.bind(this),
                this.prepareVegan.bind(this),
                this.veganCheck.bind(this),
                this.considerVeganDishes.bind(this),
                this.allergyCheck.bind(this),
                this.guidedResult.bind(this)
            ]));
        this.initialDialogId = GUIDED;
    }

    async prepare(step) {
        // TODO: Prepare stuff.
        return await step.next();
    }

    async prepareVegetarian(step) {
        // TODO: Prepare vegetarian.
        return await step.prompt(VEGETARIAN_PROMPT, {
            prompt: VEGETARIAN_PROMPT_MESSAGE,
            choices: ChoiceFactory.toChoices(userChoices),
            style: 1
        });
    }

    async vegetarianCheck(step) {
        const isVegetarian = step.result.value;
        if (isVegetarian === userAccepts) {
            return await step.next();
        } else {
            return await step.prompt(CONSIDER_VEGETARIAN_PROMPT, {
                prompt: CONSIDER_VEGETARIAN_PROMPT_MESSAGE,
                choices: ChoiceFactory.toChoices(userChoices),
                style: 1
            });
        }
    }

    async considerVegetarianDishes(step) {
        const considerVegetarian = step.result.value;
        // if (considerVegetarian === userAccepts) {
        //     return await step.next();
        // } else {
        //     return await step.prompt(CONSIDER_VEGETARIAN_PROMPT, {
        //         prompt: CONSIDER_VEGETARIAN_PROMPT_MESSAGE,
        //         choices: ChoiceFactory.toChoices(userChoices),
        //         style: 1
        //     });
        // }
        return await step.next();
    }

    async prepareVegan(step) {
        // TODO: Prepare vegan.
        return await step.prompt(VEGAN_PROMPT, {
            prompt: VEGAN_PROMPT_MESSAGE,
            choices: ChoiceFactory.toChoices(userChoices),
            style: 1
        });
    }

    async veganCheck(step) {
        const isVegan = step.result.value;
        if (isVegan === userAccepts) {
            return await step.next();
        } else {
            return await step.prompt(CONSIDER_VEGAN_PROMPT, {
                prompt: CONSIDER_VEGAN_PROMPT_MESSAGE,
                choices: ChoiceFactory.toChoices(userChoices),
                style: 1
            });
        }
    }

    async considerVeganDishes(step) {
        const considerVegan = step.result.value;
        // if (considerVegan === userAccepts) {
        //     return await step.next();
        // } else {
        //     return await step.prompt(CONSIDER_VEGAN_PROMPT, {
        //         prompt: ,
        //         choices: ChoiceFactory.toChoices(userChoices),
        //         style: 1
        //     });
        // }
        return await step.next();
    }

    async allergyCheck(step) {
        return await step.next();
    }

    async guidedResult(step) {
        const study = new Study();
        Object.assign(study, step.result);

        console.log(study);
        await step.endDialog();
    }
}

module.exports.GuidedCantinaDialog = GuidedCantinaDialog;
