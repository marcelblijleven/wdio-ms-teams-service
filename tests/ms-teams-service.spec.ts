import MsTeamsService from "../src";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import TestResultContainer, { ITestResult } from "../src/test-result-container";
import { AdaptiveCard } from "../src/adaptive-card";
import IncomingWebhook from "../src/incoming-webhook";
import { filterPassedTests } from "../src/ms-teams-service";

describe("MsTeamsService", function () {
    const serviceOptions = {
        webhookURL: "https://your-webhook.url.com/c0ffee",
    };
    const capabilities = {
        browserName: "chrome",
    };
    const options = {
        capabilities: {},
    };

    test("Should set the expected values in the class constructor", function () {
        const service = new MsTeamsService(serviceOptions, capabilities, options);
        // Verify private properties
        expect((service as any)._webhook instanceof IncomingWebhook).toBeTruthy();
        expect((service as any)._capabilities).toEqual(capabilities);
        expect((service as any)._config).toEqual(options);
        // Verify test result container initial values
        expect(service.testResultContainer.testNames).toHaveLength(0);
        expect(Object.getOwnPropertyNames(service.testResultContainer.testResults)).toHaveLength(0);
    });

    describe("MsTeamsService.before()", function () {
        test("Should set the browser property in the before hook", function () {
            const browser: any = { mock: "mock" };
            const service = new MsTeamsService(serviceOptions, capabilities, options);
            service.before(capabilities, [], browser);
            expect((service as any)._browser).toEqual(browser);
        });
    });

    describe("MsTeamsService.afterTest()", function () {
        const mockTest: Test = {
            ctx: undefined,
            file: "./mock/test-file.spec.ts",
            fullName: "Mock Test Name",
            fullTitle: "Mock Test Title",
            parent: "Mock parent",
            pending: false,
            type: "",
            title: "Test title",
            description: "A test description",
        };
        const mockContext: any = {};
        const mockTestResult: TestResult = {
            duration: 0,
            exception: "",
            retries: { attempts: 0, limit: 0 },
            status: "",
            passed: true,
            error: undefined,
        };

        test("Should add test results in afterTest hook", async function () {
            const service = new MsTeamsService(serviceOptions, capabilities, options);

            const expectedResult: ITestResult = {
                description: "A test description",
                error: "",
                passed: true,
                title: "Test title",
            };

            await service.afterTest(mockTest, mockContext, mockTestResult);
            const testResultContainer = service.testResultContainer;
            expect(testResultContainer.testNames).toHaveLength(1);
            expect(testResultContainer.testNames[0]).toEqual("Mock parent");
            expect(testResultContainer.testResults["Mock parent"]).toEqual([expectedResult]);
        });

        test("Should use test full name if parent name is not available", async function () {
            const service = new MsTeamsService(serviceOptions, capabilities, options);

            const expectedResult: ITestResult = {
                description: "A test description",
                error: "",
                passed: true,
                title: "Test title",
            };

            const mockTest2 = { ...mockTest };
            mockTest2.parent = "";
            mockTest2.fullName = "Mock test full name";

            await service.afterTest(mockTest2, mockContext, mockTestResult);
            const testResultContainer = service.testResultContainer;
            expect(testResultContainer.testNames).toHaveLength(1);
            expect(testResultContainer.testNames[0]).toEqual("Mock test full name");
            expect(testResultContainer.testResults["Mock test full name"]).toEqual([expectedResult]);
        });
    });

    describe("MsTeamsService.after()", function () {
        test("Should call IncomingWebhook.send with test results", function () {
            const service = new MsTeamsService(serviceOptions, capabilities, options);
            const result: ITestResult = {
                error: "",
                passed: false,
                title: "Test title",
            };

            service.testResultContainer.addTest("Mock test", result);
            (service as any)._webhook.send = jest.fn();
            service.after();

            const adaptiveCard = new AdaptiveCard("An automated test run just completed", service.testResultContainer);
            expect((service as any)._webhook.send).toHaveBeenCalledWith(adaptiveCard.toString());
        });

        test("Should not call webhook if failedTestsOnly is set and all tests have passed", function () {
            const mockSend = jest.fn();
            const failingTestsOptions = { ...serviceOptions, failingTestsOnly: true };
            const service = new MsTeamsService(failingTestsOptions, capabilities, options);
            const result: ITestResult = {
                error: "",
                passed: true,
                title: "Test title",
            };
            service.testResultContainer.addTest("Mock test", result);
            (service as any)._webhook.send = mockSend;
            service.after();
            expect(mockSend).not.toHaveBeenCalled();
        });

        test("Should call webhook if failedTestsOnly is set and not all tests have passed", function () {
            const mockSend = jest.fn();
            const testName = "Mock test";
            const failingTestsOptions = { ...serviceOptions, failingTestsOnly: true };
            const service = new MsTeamsService(failingTestsOptions, capabilities, options);
            const passedResult: ITestResult = {
                error: "",
                passed: true,
                title: "Test title",
            };
            const failedResult: ITestResult = {
                error: "",
                passed: false,
                title: "Test title",
            };
            service.testResultContainer.addTest(testName, passedResult);
            service.testResultContainer.addTest(testName, failedResult);
            (service as any)._webhook.send = mockSend;
            service.after();
            expect(mockSend).toHaveBeenCalled();
            expect(service.testResultContainer.testNames).toHaveLength(1);
            expect(service.testResultContainer.testResults[testName]).toHaveLength(2);
        });
    });
});

describe("filterPassedTests", function () {
    test("Should filter out all passed tests", function () {
        const container = new TestResultContainer();
        container.testNames.push("has failed");
        container.testResults["has failed"] = [
            {
                description: "A test description for a failed test",
                error: "",
                passed: false,
                title: "Failed test title",
            },
            {
                description: "A test description for a passed test",
                error: "",
                passed: true,
                title: "Passed test title",
            },
        ];
        container.testNames.push("has only passed");
        container.testResults["has only passed"] = [
            {
                description: "A test description for a passed test",
                error: "",
                passed: true,
                title: "Passed test title",
            },
            {
                description: "A test description for a passed test",
                error: "",
                passed: true,
                title: "Passed test title",
            },
        ];

        filterPassedTests(container);
        expect(container.testNames).toHaveLength(1);
        expect(container.testNames.includes("has only passed")).toBeFalsy();
        expect(container.testNames.includes("has failed")).toBeTruthy();
    });
});
