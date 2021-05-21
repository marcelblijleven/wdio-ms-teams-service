import { MsTeamsServiceError } from "../src/errors";

describe("Utils", function () {
    describe("MsTeamsServiceError", function () {
        test("Should provide message as stack instead of actual stack trace", function () {
            const err = new MsTeamsServiceError("test error");
            expect(err.name).toEqual("MsTeamsServiceError");
            expect(err.stack).toEqual("MsTeamsServiceError: test error");
        });
    });
});
