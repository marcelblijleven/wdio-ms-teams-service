import IncomingWebhook from "../src/incoming-webhook";
import { AxiosResponse } from "axios";

describe("IncomingWebhook", function () {
    test("It should throw an MsTeamsServiceError when an undefined url is provided", function () {
        const url = undefined;
        expect(() => new IncomingWebhook(url as unknown as string)).toThrowError("no webhook URL provided");
    });

    test("It should throw an MsTeamsServiceError when an undefined url is provided", function () {
        const url = "";
        expect(() => new IncomingWebhook(url)).toThrowError("no webhook URL provided");
    });

    describe("IncomingWebhook.send()", function () {
        test("Should return MsTeamsWebhookResult on successful post", function () {
            const webhook = new IncomingWebhook("https://test.url.com");
            const mockPost = jest.fn().mockImplementation(() => {
                const response: AxiosResponse = {
                    config: {},
                    data: "data",
                    headers: undefined,
                    status: 200,
                    statusText: "OK",
                };
                return response;
            });
            (webhook as any)._axios.post = mockPost;
            webhook.send("message");
            expect(mockPost).toHaveBeenCalledWith("https://test.url.com", "message");
        });
    });
});
