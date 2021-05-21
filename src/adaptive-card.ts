import { ITestResult } from "./types";

interface IAdaptiveCard {
    type: "message";
    attachments: Array<IAdaptiveCardAttachment>;
}

interface IAdaptiveCardAttachment {
    contentType: "application/vnd.microsoft.card.adaptive";
    contentUrl: string | null;
    content: IAdaptiveCardContent;
}

interface IAdaptiveCardContent {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json";
    type: "AdaptiveCard";
    version: "1.2";
    body: Array<IAdaptiveCardContainer | IAdaptiveCardTextBlock | IAdaptiveCardFactSet>;
}

interface IAdaptiveCardContainer {
    type: "Container";
    padding: string;
    items: Array<IAdaptiveCardTextBlock | IAdaptiveCardFactSet>;
}

interface IAdaptiveCardTextBlock {
    type: "TextBlock";
    text: string;
    wrap?: boolean;
    weight?: "lighter" | "default" | "bolder";
}

interface IAdaptiveCardFactSet {
    type: "FactSet";
    facts: Array<{ title: string; value: string }>;
    spacing: "none" | "small" | "default" | "medium" | "large" | "extraLarge";
}

export class AdaptiveCard {
    private readonly _card: IAdaptiveCard;

    constructor(message: string, results: Array<ITestResult>) {
        this._card = {
            type: "message",
            attachments: [
                {
                    contentType: "application/vnd.microsoft.card.adaptive",
                    contentUrl: null,
                    content: {
                        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                        type: "AdaptiveCard",
                        version: "1.2",
                        body: [
                            AdaptiveCard._generateTextBlock("Automated test results | WebdriverIO", true, "bolder"),
                            AdaptiveCard._generateTextBlock(message, true, "default"),
                            AdaptiveCard._generateFactSet(AdaptiveCard._generateFacts(results)),
                            AdaptiveCard._generateFactSet(AdaptiveCard._generateFactsOverview(results)),
                        ],
                    },
                },
            ],
        };
    }

    content() {
        return this._card;
    }

    toString() {
        return JSON.stringify(this.content());
    }

    private static _generateFactsOverview(results: Array<ITestResult>): Array<{ title: string; value: string }> {
        const total = { title: "Total tests", value: results.length.toString(10) };
        const passed = { title: "Passed", value: results.filter((result) => result.passed).length.toString(10) };
        const failed = { title: "Failed", value: results.filter((result) => !result.passed).length.toString(10) };
        return [total, passed, failed];
    }

    private static _generateFacts(results: Array<ITestResult>): Array<{ title: string; value: string }> {
        const facts: Array<{ title: string; value: string }> = [];
        for (const result of results) {
            const value = result.passed ? "passed" : "failed";
            facts.push({ title: result.title, value: value });
        }

        return facts;
    }

    private static _generateTextBlock(
        message: string,
        wrap: boolean,
        weight: "lighter" | "default" | "bolder",
    ): IAdaptiveCardTextBlock {
        return {
            type: "TextBlock",
            text: message,
            wrap: wrap,
            weight: weight,
        };
    }

    private static _generateFactSet(facts: Array<{ title: string; value: string }>): IAdaptiveCardFactSet {
        return {
            type: "FactSet",
            facts: facts,
            spacing: "extraLarge",
        };
    }
}
