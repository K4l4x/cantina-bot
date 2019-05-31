/**
 *
 */
class MenuCardSchema {
    getMenuCard(menu) {
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
                            "value": "2,70€"
                        },
                        {
                            "title": "Bedienstete:",
                            "value": "4,40€"
                        },
                        {
                            "title": "Gäste:",
                            "value": "5,30€"
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
