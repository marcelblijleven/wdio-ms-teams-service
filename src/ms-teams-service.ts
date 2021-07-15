import type { Services, Frameworks } from "@wdio/types";
import type { Capabilities, RemoteCapability } from "@wdio/types/build/Capabilities";
import type { Testrunner as TestRunnerOptions } from "@wdio/types/build/Options";
import type { PickleStep, Feature } from "@cucumber/messages";
import type { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import { Browser, MultiRemoteBrowser } from "webdriverio";
import IncomingWebhook from "./incoming-webhook";
import { AdaptiveCard } from "./adaptive-card";
import TestResultContainer, { ITestResult } from "./test-result-container";
import { Pickle } from "@cucumber/messages";

interface MsTeamsServiceOptions extends Services.ServiceOption {
    webhookURL: string;
    failingTestsOnly?: boolean;
    message?: string;
    timeout?: number;
}

export default class MsTeamsService implements Services.ServiceInstance {
    readonly testResultContainer: TestResultContainer;
    private _webhook: IncomingWebhook;
    private _browser?: Browser<"async"> | MultiRemoteBrowser<"async">;
    private _capabilities: Capabilities;
    private _config: TestRunnerOptions;
    private readonly _failingTestsOnly: boolean;
    private readonly _message?: string;

    constructor(serviceOptions: MsTeamsServiceOptions, capabilities: Capabilities, config: TestRunnerOptions) {
        this._webhook = new IncomingWebhook(serviceOptions.webhookURL, serviceOptions.timeout);
        this._capabilities = capabilities;
        this._config = config;
        this.testResultContainer = new TestResultContainer();
        this._failingTestsOnly = !!serviceOptions.failingTestsOnly;
        this._message = serviceOptions.message;
    }

    before(
        capabilities: RemoteCapability,
        specs: string[],
        browser: Browser<"async"> | MultiRemoteBrowser<"async">,
    ): void {
        this._browser = browser;
    }

    async afterTest(test: Test, context: any, result: TestResult): Promise<void> {
        const testName = test.parent || test.fullName;
        const testResult: ITestResult = {
            passed: result.passed,
            error: result.error || "",
            title: test.title,
            description: test.description,
        };

        this.testResultContainer.addTest(testName, testResult);
    }

    async afterStep(step: PickleStep, scenario: Pickle, result: Frameworks.PickleResult): Promise<void> {
        const testName = scenario.name;
        const testResult: ITestResult = {
            passed: result.passed,
            error: result.error || "",
            title: step.text,
            description: "",
        };

        this.testResultContainer.addTest(testName, testResult);
    }

    // async afterScenario(world: ITestCaseHookParameter, result: Frameworks.PickleResult): Promise<void> {
    //
    // }
    //
    // async afterFeature(uri: string, feature: Feature): Promise<void> {
    //
    // }

    async after(): Promise<void> {
        const message = this._message ? this._message : "An automated test run just completed";

        if (this._failingTestsOnly) {
            if (this.testResultContainer.failedTests === 0) {
                return;
            }

            filterPassedTests(this.testResultContainer);
            if (this.testResultContainer.testNames.length === 0) {
                return;
            }
        }

        const adaptiveCard = new AdaptiveCard(message, this.testResultContainer);
        await this._webhook.send(adaptiveCard.toString());
    }
}

/**
 * Filters out any top level tests that have no failing test results. This function modifies the provided
 * container parameter and doesn't return anything
 * @param container
 */
export function filterPassedTests(container: TestResultContainer): void {
    const names = [];

    for (const name of container.testNames) {
        const allPassed = container.testResults[name].every((result) => result.passed);

        if (!allPassed) {
            names.push(name);
        } else {
            delete container.testResults[name];
        }
    }

    container.testNames = names;
}
