import MsTeamsService from "../src";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import { ITestResult } from "../src/types";
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
        expect((service as any)._webhook instanceof IncomingWebhook).toBeTruthy();
        expect((service as any)._capabilities).toEqual(capabilities);
        expect((service as any)._config).toEqual(options);
        expect((service as any)._testResults).toHaveLength(0);
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
        test("Should add test results in afterTest hook", async function () {
            const service = new MsTeamsService(serviceOptions, capabilities, options);
            const mockTest: Test = {
                ctx: undefined,
                file: "./mock/test-file.spec.ts",
                fullName: "Mock Test Name",
                fullTitle: "Mock Test Title",
                parent: "",
                pending: false,
                type: "",
                title: "Test title",
                description: "A test description",
            };
            const mockContext: any = {};
            const result: TestResult = {
                duration: 0,
                exception: "",
                retries: { attempts: 0, limit: 0 },
                status: "",
                passed: true,
                error: undefined,
            };

            await service.afterTest(mockTest, mockContext, result);
            expect((service as any)._testResults).toHaveLength(1);
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

            (service as any)._testResults.push(result);
            (service as any)._webhook.send = jest.fn();
            service.after();

            const adaptiveCard = new AdaptiveCard(
                "An automated test run just completed",
                (service as any)._testResults,
            );
            expect((service as any)._webhook.send).toHaveBeenCalledWith(adaptiveCard.toString());
        });
    });
});
