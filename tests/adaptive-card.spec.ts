import { AdaptiveCard } from "../src/adaptive-card";
import TestResultContainer, { ITestResult } from "../src/test-result-container";

const testResults: Array<ITestResult> = [
    {
        title: "Should add this to the test",
        passed: true,
        error: "",
        description: undefined,
    },
    {
        title: "Should also add this to the test",
        passed: false,
        error: "",
        description: undefined,
    },
    {
        title: "Should also add this to the test as an extra result",
        passed: false,
        error: "",
        description: undefined,
    },
];

const expected = {
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
                    {
                        type: "TextBlock",
                        text: "Automated test results | WebdriverIO",
                        wrap: true,
                        weight: "bolder",
                    },
                    { type: "TextBlock", text: "This is a test", wrap: true, weight: "default" },
                    {
                        type: "TextBlock",
                        text: "mock test",
                        wrap: false,
                        weight: "bolder",
                    },
                    {
                        type: "RichTextBlock",
                        inlines: [
                            {
                                type: "TextRun",
                                text: "✓ ",
                                color: "good",
                                weight: "bolder",
                                fontType: "monospace",
                            },
                            "Should add this to the test",
                        ],
                        horizontalAlignment: "left",
                    },
                    {
                        type: "RichTextBlock",
                        inlines: [
                            {
                                type: "TextRun",
                                text: "✖ ",
                                color: "warning",
                                weight: "bolder",
                                fontType: "monospace",
                            },
                            "Should also add this to the test",
                        ],
                        horizontalAlignment: "left",
                    },
                    {
                        type: "RichTextBlock",
                        inlines: [
                            {
                                type: "TextRun",
                                text: "✖ ",
                                color: "warning",
                                weight: "bolder",
                                fontType: "monospace",
                            },
                            "Should also add this to the test as an extra result",
                        ],
                        horizontalAlignment: "left",
                    },
                    {
                        type: "FactSet",
                        facts: [
                            { title: "Total tests", value: "3" },
                            { title: "Passed", value: "1" },
                            {
                                title: "Failed",
                                value: "2",
                            },
                        ],
                        spacing: "extraLarge",
                    },
                ],
                msteams: { width: "full" },
            },
        },
    ],
};

describe("Adaptive Card", function () {
    const resultContainer = new TestResultContainer();

    for (const result of testResults) {
        resultContainer.addTest("mock test", result);
    }

    const adaptiveCard = new AdaptiveCard("This is a test", resultContainer);

    test("Should generate the correct content", function () {
        expect(expected).toEqual(adaptiveCard.content());
    });

    test("Should generate the correct string", function () {
        expect(JSON.stringify(expected)).toEqual(adaptiveCard.toString());
    });
});
