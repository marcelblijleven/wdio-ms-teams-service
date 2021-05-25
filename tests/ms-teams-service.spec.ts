import MsTeamsService from "../src";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import { ITestResult } from "../src/test-result-container";
import { AdaptiveCard } from "../src/adaptive-card";
import IncomingWebhook from "../src/incoming-webhook";

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
    });
});
