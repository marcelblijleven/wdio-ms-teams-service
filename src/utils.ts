import axios, {AxiosInstance, AxiosResponse} from "axios";
import {MsTeamsWebhookResult} from "./types";

export default class IncomingWebhook {
  private readonly _url: string;
  private _axios!: AxiosInstance;

  constructor(url: string) {
    this._url = url;

    if (!this._url) {
      console.error("[ms-teams-service]: no webhook URL provided");
      return;
    }

    this._axios = axios.create({
      baseURL: this._url,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json"
      },
    });
  }

  public async send(message: string): Promise<MsTeamsWebhookResult> {
    let response: AxiosResponse;

    try {
      response = await this._axios.post(this._url, message);
      return {message: response.data}
    } catch (error) {
      console.error(`[ms-teams-service]: ${error}`);
      return {message: error};
    }
  }
}
