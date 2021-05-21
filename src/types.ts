export interface IMsTeamsWebhookResult {
    message: string;
}

export interface ITestResult {
    passed: boolean;
    title: string;
    description?: string;
    error: string;
}
