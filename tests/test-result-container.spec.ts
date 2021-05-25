import TestResultContainer, { ITestResult } from "../src/test-result-container";

const testResult: ITestResult = {
    passed: true,
    title: "test title",
    error: "",
};

describe("TestResultContainer", function () {
    test("Should set properties to default values", function () {
        const container = new TestResultContainer();
        expect(container.testNames).toHaveLength(0);
        expect(container.testResults).toEqual({});
    });

    describe("TestResultContainer.addTest()", function () {
        test("Should add testName and testResults to container properties", function () {
            const container = new TestResultContainer();
            const testName = "sample test one";

            container.addTest(testName, testResult);
            expect(container.testNames).toHaveLength(1);
            expect(container.testNames[0]).toEqual(testName);
            expect(container.testResults[testName]).not.toBeUndefined();
            expect(container.testResults[testName]).toHaveLength(1);
            expect(container.testResults[testName][0]).toEqual(testResult);
        });

        test("Should be possible to add multiple test results under the name", function () {
            const container = new TestResultContainer();
            const testName = "sample test one";

            container.addTest(testName, testResult);
            container.addTest(testName, testResult);
            expect(container.testNames).toHaveLength(1);
            expect(container.testNames[0]).toEqual(testName);
            expect(container.testResults[testName]).not.toBeUndefined();
            expect(container.testResults[testName]).toHaveLength(2);
            expect(container.testResults[testName][0]).toEqual(testResult);
            expect(container.testResults[testName][1]).toEqual(testResult);
        });

        test("Should be possible to add multiple test names", function () {
            const container = new TestResultContainer();
            const testName = "sample test one";
            const testName2 = "sample test two";

            container.addTest(testName, testResult);
            container.addTest(testName2, testResult);
            expect(container.testNames).toHaveLength(2);
            expect(container.testNames[0]).toEqual(testName);
            expect(container.testNames[1]).toEqual(testName2);
            expect(container.testResults[testName]).not.toBeUndefined();
            expect(container.testResults[testName2]).not.toBeUndefined();
            expect(container.testResults[testName]).toHaveLength(1);
            expect(container.testResults[testName][0]).toEqual(testResult);
            expect(container.testResults[testName2]).toHaveLength(1);
            expect(container.testResults[testName2][0]).toEqual(testResult);
        });

        test("Should update the test totals when a test is added", function () {
            const container = new TestResultContainer();
            const testName = "sample test one";
            const testName2 = "sample test two";
            const testResultFailed = { ...testResult, passed: false };

            expect(container.failedTests).toEqual(0);
            expect(container.passedTests).toEqual(0);
            expect(container.totalTests).toEqual(0);

            container.addTest(testName, testResult);
            container.addTest(testName2, testResultFailed);

            expect(container.failedTests).toEqual(1);
            expect(container.passedTests).toEqual(1);
            expect(container.totalTests).toEqual(2);
        });
    });
});
