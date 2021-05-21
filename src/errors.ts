export class MsTeamsServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MsTeamsServiceError";
        this.stack = `${this.name}: ${message}`;
    }
}
