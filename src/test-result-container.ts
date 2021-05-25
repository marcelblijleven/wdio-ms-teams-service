export interface ITestResults {
    [key: string]: Array<ITestResult>;
}

export interface ITestResult {
    passed: boolean;
    title: string;
    description?: string;
    error: string;
}

export default class TestResultContainer {
    testNames: Array<string>;
    testResults: ITestResults;
    passedTests: number;
    failedTests: number;
    totalTests: number;

    constructor() {
        this.testNames = [];
        this.testResults = {};
        this.passedTests = 0;
        this.failedTests = 0;
        this.totalTests = 0;
    }

    addTest(testName: string, result: ITestResult): void {
        if (this.testNames.indexOf(testName) === -1) {
            // Add to testNames array to preserve test order
            this.testNames.push(testName);
        }

        if (!Object.prototype.hasOwnProperty.call(this.testResults, testName)) {
            this.testResults[testName] = [];
        }

        this.testResults[testName].push(result);

        result.passed ? (this.passedTests += 1) : (this.failedTests += 1);
        this.totalTests += 1;
    }
}
