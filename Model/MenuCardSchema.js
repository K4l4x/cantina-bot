/**
 *
 */
class MenuCardSchema {
    createMenuCard(menu) {
        return {
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "size": "Medium",
                    "weight": "Bolder",
                    "text": menu.menuType
                },
                {
                    "type": "TextBlock",
                    "text": menu.description,
                    "wrap": true
                },
                {
                    "type": "FactSet",
                    "facts": [
                        {
                            "title": "Studierende:",
                            "value": "€"
                        },
                        {
                            "title": "Bedienstete:",
                            "value": "€"
                        },
                        {
                            "title": "Gäste:",
                            "value": "€"
                        }
                    ]
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        };
    }
}

exports.MenuCardSchema = MenuCardSchema;
