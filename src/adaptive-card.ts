import TestResultContainer, { ITestResult } from "./test-result-container";

interface IAdaptiveCard {
    type: "message";
    attachments: Array<ICardAttachment>;
}

interface ICardAttachment {
    contentType: "application/vnd.microsoft.card.adaptive";
    contentUrl: string | null;
    content: IAdaptiveCardContent;
}

interface IAdaptiveCardContent {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json";
    type: "AdaptiveCard";
    version: "1.2";
    body: Array<ICardContainer | ITextBlock | IFactSet | IRichTextBlock>;
    msteams?: { width: "full" };
}

interface ICardContainer {
    type: "Container";
    padding: string;
    items: Array<ITextBlock | IFactSet>;
}

interface ITextBlock {
    type: "TextBlock";
    text: string;
    wrap?: boolean;
    weight?: "lighter" | "default" | "bolder";
}

interface IFactSet {
    type: "FactSet";
    facts: Array<{ title: string; value: string }>;
    spacing: "none" | "small" | "default" | "medium" | "large" | "extraLarge";
}

interface IRichTextBlock {
    type: "RichTextBlock";
    inlines: Array<string | ITextRun>;
    horizontalAlignment?: "left" | "center" | "right";
}

interface ITextRun {
    type: "TextRun";
    text: string;
    color?: "default" | "dark" | "light" | "accent" | "good" | "warning" | "attention";
    fontType?: "default" | "monospace";
    highlight?: boolean;
    isSubtle?: true;
    italic?: boolean;
    size?: "default" | "small" | "medium" | "large" | "extraLarge";
    strikethrough?: boolean;
    underline?: boolean;
    weight: "default" | "lighter" | "bolder";
}

export class AdaptiveCard {
    private readonly _card: IAdaptiveCard;

    constructor(message: string, resultContainer: TestResultContainer) {
        const body: IAdaptiveCardContent["body"] = [];
        body.push(AdaptiveCard._generateTextBlock("Automated test results | WebdriverIO", true, "bolder"));
        body.push(AdaptiveCard._generateTextBlock(message, true, "default"));

        for (const test of resultContainer.testNames) {
            const results = resultContainer.testResults[test];
            body.push(AdaptiveCard._generateTextBlock(test, false, "bolder"));

            for (const result of results) {
                body.push(createTestResultRichTextBox(result));
            }
        }

        body.push(AdaptiveCard._generateFactSet(AdaptiveCard._generateFactsOverview(resultContainer)));

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
                        body: body,
                        msteams: {
                            width: "full",
                        },
                    },
                },
            ],
        };
    }

    content(): IAdaptiveCard {
        return this._card;
    }

    toString(): string {
        return JSON.stringify(this.content());
    }

    private static _generateFactsOverview(
        resultContainer: TestResultContainer,
    ): Array<{ title: string; value: string }> {
        const total = { title: "Total tests", value: resultContainer.totalTests.toString(10) };
        const passed = { title: "Passed", value: resultContainer.passedTests.toString(10) };
        const failed = { title: "Failed", value: resultContainer.failedTests.toString(10) };
        return [total, passed, failed];
    }

    private static _generateTextBlock(
        message: string,
        wrap: boolean,
        weight: "lighter" | "default" | "bolder",
    ): ITextBlock {
        return {
            type: "TextBlock",
            text: message,
            wrap: wrap,
            weight: weight,
        };
    }

    private static _generateFactSet(facts: Array<{ title: string; value: string }>): IFactSet {
        return {
            type: "FactSet",
            facts: facts,
            spacing: "extraLarge",
        };
    }
}

function createTestResultRichTextBox(result: ITestResult): IRichTextBlock {
    const block: IRichTextBlock = {
        type: "RichTextBlock",
        inlines: [],
        horizontalAlignment: "left",
    };

    const textRun: ITextRun = {
        type: "TextRun",
        text: result.passed ? "✓ " : "✖ ",
        color: result.passed ? "good" : "warning",
        weight: "bolder",
        fontType: "monospace",
    };

    block.inlines.push(textRun, result.title);
    return block;
}
