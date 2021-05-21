import type { Services } from "@wdio/types";
import type { Capabilities, RemoteCapability } from "@wdio/types/build/Capabilities";
import type { Testrunner as TestRunnerOptions } from "@wdio/types/build/Options";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import { Browser, MultiRemoteBrowser } from "webdriverio";
import IncomingWebhook from "./incoming-webhook";
import { AdaptiveCard } from "./adaptive-card";
import TestResultContainer, { ITestResult } from "./test-result-container";

export default class MsTeamsService implements Services.ServiceInstance {
    readonly testResultContainer: TestResultContainer;
    private _webhook: IncomingWebhook;
    private _browser?: Browser<"async"> | MultiRemoteBrowser<"async">;
    private _capabilities: Capabilities;
    private _config: TestRunnerOptions;

    constructor(serviceOptions: Services.ServiceOption, capabilities: Capabilities, config: TestRunnerOptions) {
        this._webhook = new IncomingWebhook(serviceOptions.webhookURL);
        this._capabilities = capabilities;
        this._config = config;
        this.testResultContainer = new TestResultContainer();
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

    async after(): Promise<void> {
        const message = "An automated test run just completed";
        const adaptiveCard = new AdaptiveCard(message, this.testResultContainer);
        await this._webhook.send(adaptiveCard.toString());
    }
}
