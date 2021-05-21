# wdio-ms-teams-reporter

This service will report your test run results to a Microsoft Teams channel using a webhook.

(note: this has only been tested with WebdriverIO v7)

## Setup

Install `wdio-ms-teams-service` as a devDependency

```
npm install wdio-ms-teams-service --save-dev
```

Next, configure your config file

```js
// wdio.conf.js
export.config = {
    // ...
    services: ["ms-teams", {
        webhookURL: "https://your-webhook.url/c0ffee"
    }]
    // ...
};
```
