import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IMsTeamsWebhookResult } from "./types";
import { MsTeamsServiceError } from "./errors";

export default class IncomingWebhook {
    private readonly _url: string;
    private readonly _timeout: number;
    private _axios!: AxiosInstance;

    constructor(url: string, timeout?: number) {
        this._url = url;
        this._timeout = timeout || 10000;

        if (!this._url) {
            throw new MsTeamsServiceError("no webhook URL provided");
        }

        this._axios = axios.create({
            baseURL: this._url,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public async send(message: string): Promise<IMsTeamsWebhookResult> {
        let response: AxiosResponse;

        try {
            response = await this._axios.post(this._url, message);
            return { message: response.data };
        } catch (error) {
            throw new MsTeamsServiceError(error.message);
        }
    }
}
