const promise = require('bluebird'),
    crypto = require('crypto'),
    rp = require('request-promise');

module.exports = class client {

    constructor(options) {
        this.host = options.host;
        this.key = options.key;
        this.secret = options.secret;
    }

    static async sha256(value) {
        var hash = crypto.createHash('sha256');
        hash.update(value, 'utf8');
        var hashedValue = hash.digest('hex');
        return hashedValue;
    }

    static async genenerateHMAC(url, body) {
        let consumer_id = this.key;
        let secret = this.secret;
        let counter = 1;
        let content = JSON.stringify(body || {});
        let prehash = `${secret}${counter}${content}`;
        let signature = client.sha256(prehash);
        return promise.resolve({
            type: 'sha256',
            counter: 1,
            signature,
            consumer_id
        });
    }

    static async get(route) {
        return client.genenerateHMAC(route).then((hmac) => {
            return rp({
                method: 'GET',
                uri: `${this.host}${route}`,
                headers: {
                    'content-type': 'application/json',
                    'Consumer-ID': hmac.consumer_id,
                    'Counter': hmac.counter,
                    'Signature-Type': hmac.type,
                    'Signature': hmac.signature
                },
                json: true
            }).then((data) => {
                return data;
            });
        });
    }

    static async post(route, body) {
        return client.genenerateHMAC(route, body).then((hmac) => {
            return rp({
                method: 'POST',
                uri: `${this.host}${route}`,
                headers: {
                    'content-type': 'application/json',
                    'Consumer-ID': hmac.consumer_id,
                    'Counter': hmac.counter,
                    'Signature-Type': hmac.type,
                    'Signature': hmac.signature
                },
                body: body,
                json: true
            }).then((data) => {
                return data;
            });
        });
    }

    static async devices() {
        return client.get('/v1/devices').then((devices) => {
            return devices;
        });
    }

    static async call(options) {
        return client.post(`/v1/devices/${options.device_id}/call`, {
            caller_id: options.caller_id,
            action: options.action
        }).then((data) => {
            return data;
        });
    }

    static async privacy(options) {
        return client.post(`/v1/devices/${options.device_id}/privacy`, {
            privacy_till: options.privacy_till
        }).then(() => {
            return;
        });
    }

    static async screen_capture(options) {
        return client.post(`/v1/devices/${options.device_id}/screen_capture`).then(() => {
            return;
        });
    }

    static async screen(options) {
        return client.post(`/v1/devices/${options.device_id}/screen`).then((screen) => {
            return {
                image: screen.image
            };
        });
    }

    static async custom_url(options) {
        return client.post(`/v1/devices/${options.device_id}/custom_url`, {
            url: url
        }).then(() => {
            return;
        });
    }
};
