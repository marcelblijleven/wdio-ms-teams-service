import type { Services} from "@wdio/types";
import type { Capabilities} from "@wdio/types/build/Capabilities";
import type { Testrunner as TestRunnerOptions } from "@wdio/types/build/Options";
import {Test, TestResult} from "@wdio/types/build/Frameworks";

export default class MsTeamsService implements Services.ServiceInstance {
  private _failedTests: number
  private _passedTests: number
  private _testsCount: number

  constructor(serviceOptions: Services.ServiceOption, capabilities: Capabilities, config: TestRunnerOptions) {
    this._failedTests = 0;
    this._passedTests = 0;
    this._testsCount = 0;
  }

  async afterTest(test: Test, context: any, result: TestResult) {
    this._passedTests += 1;
  }
}
