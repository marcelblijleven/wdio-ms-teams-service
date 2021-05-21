import { AdaptiveCard } from "../src/adaptive-card";
import { ITestResult } from "../src/types";

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
                        type: "FactSet",
                        facts: [
                            {
                                title: "Should add this to the test",
                                value: "passed",
                            },
                            {
                                title: "Should also add this to the test",
                                value: "failed",
                            },
                            { title: "Should also add this to the test as an extra result", value: "failed" },
                        ],
                        spacing: "extraLarge",
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
            },
        },
    ],
};

describe("Adaptive Card", function () {
    const adaptiveCard = new AdaptiveCard("This is a test", testResults);

    test("Should generate the correct content", function () {
        expect(expected).toEqual(adaptiveCard.content());
    });

    test("Should generate the correct string", function () {
        expect(JSON.stringify(expected)).toEqual(adaptiveCard.toString());
    });
});
