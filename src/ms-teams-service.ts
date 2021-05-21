import type { Services } from "@wdio/types";
import type { Capabilities, RemoteCapability } from "@wdio/types/build/Capabilities";
import type { Testrunner as TestRunnerOptions } from "@wdio/types/build/Options";
import { Test, TestResult } from "@wdio/types/build/Frameworks";
import { Browser, MultiRemoteBrowser } from "webdriverio";
import IncomingWebhook from "./incoming-webhook";
import { ITestResult } from "./types";
import { AdaptiveCard } from "./adaptive-card";

export default class MsTeamsService implements Services.ServiceInstance {
    private _webhook: IncomingWebhook;
    private readonly _testResults: Array<ITestResult>;
    private _browser?: Browser<"async"> | MultiRemoteBrowser<"async">;
    private _capabilities: Capabilities;
    private _config: TestRunnerOptions;

    constructor(serviceOptions: Services.ServiceOption, capabilities: Capabilities, config: TestRunnerOptions) {
        this._webhook = new IncomingWebhook(serviceOptions.webhookURL);
        this._capabilities = capabilities;
        this._config = config;
        this._testResults = [];
    }

    before(
        capabilities: RemoteCapability,
        specs: string[],
        browser: Browser<"async"> | MultiRemoteBrowser<"async">,
    ): void {
        this._browser = browser;
    }

    async afterTest(test: Test, context: any, result: TestResult): Promise<void> {
        const testResult: ITestResult = {
            passed: result.passed,
            error: result.error,
            title: test.title,
            description: test.description,
        };

        this._testResults.push(testResult);
    }

    async after(): Promise<void> {
        const message = "An automated test run just completed";
        const adaptiveCard = new AdaptiveCard(message, this._testResults);
        await this._webhook.send(adaptiveCard.toString());
    }
}
