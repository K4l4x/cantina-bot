/**
 * Creating card schemas. Currently the easiest way I can think off.
 */
class CardSchema {
    async createMenuCard(menu) {
        return {
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: menu.type
                },
                {
                    type: 'TextBlock',
                    text: menu.description,
                    wrap: true
                },
                {
                    type: 'FactSet',
                    facts: [
                        {
                            title: 'Studierende:',
                            value: menu.prices[0]
                        },
                        {
                            title: 'Bedienstete:',
                            value: menu.prices[1]
                        },
                        {
                            title: 'Gäste:',
                            value: menu.prices[2]
                        }
                    ]
                }
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        };
    }

    async createOpeningHoursCard(cantina) {
        return {
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'Container',
                    items: [
                        {
                            type: 'TextBlock',
                            size: 'Medium',
                            weight: 'Bolder',
                            text: 'Öffnungszeiten: ' + cantina.name
                        }
                    ]
                },
                {
                    type: 'Container',
                    items: [
                        {
                            type: 'FactSet',
                            facts: [
                                {
                                    title: 'Montag:',
                                    value: cantina.getOpeningHours().monday
                                },
                                {
                                    title: 'Dienstag:',
                                    value: cantina.getOpeningHours().tuesday
                                },
                                {
                                    title: 'Mittwoch:',
                                    value: cantina.getOpeningHours().wednesday
                                },
                                {
                                    title: 'Donnerstag:',
                                    value: cantina.getOpeningHours().thursday
                                },
                                {
                                    title: 'Freitag:',
                                    value: cantina.getOpeningHours().friday
                                }
                            ]
                        }
                    ]
                }
            ],
            actions: [
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        };
    }
}

module.exports.CardSchema = CardSchema;
