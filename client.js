const promise = require('bluebird'),
    crypto = require('crypto'),
    got = require('got');

class client {

    constructor(options) {
        this.host = options.host;
        this.key = options.key;
        this.secret = options.secret;
    }

    sha256(value) {
        var hash = crypto.createHash('sha256');
        hash.update(value, 'utf8');
        var hashedValue = hash.digest('hex');
        return hashedValue;
    }

    async genenerateHMAC(url, body) {
        let consumer_id = this.key;
        let secret = this.secret;
        let counter = 1;
        let content = JSON.stringify(body || {});
        let prehash = `${secret}${counter}${content}`;
        let signature = this.sha256(prehash);
        return promise.resolve({
            type: 'sha256',
            counter: 1,
            signature,
            consumer_id
        });
    }

    async get(route) {
        return this.genenerateHMAC(route).then((hmac) => {
            return got(`${this.host}${route}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'Consumer-ID': hmac.consumer_id,
                    'Counter': hmac.counter,
                    'Signature-Type': hmac.type,
                    'Signature': hmac.signature
                },
                responseType: 'json',
                resolveBodyOnly: true
            }).then((data) => {
                return data;
            });
        });
    }

    async post(route, body) {
        return this.genenerateHMAC(route, body).then((hmac) => {
            return got(`${this.host}${route}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Consumer-ID': hmac.consumer_id,
                    'Counter': hmac.counter,
                    'Signature-Type': hmac.type,
                    'Signature': hmac.signature
                },
                json: body,
                responseType: 'json',
                resolveBodyOnly: true
            }).then((data) => {
                return data;
            });
        });
    }

    async devices() {
        return this.get('/v1/devices').then((devices) => {
            return devices;
        });
    }

    async call(options) {
        return this.post(`/v1/devices/${options.device_id}/call`, {
            caller_id: options.caller_id,
            action: options.action
        }).then((data) => {
            return data;
        });
    }

    async privacy(options) {
        return this.post(`/v1/devices/${options.device_id}/privacy`, {
            privacy_till: options.privacy_till
        }).then(() => {
            return;
        });
    }

    async screen_capture(options) {
        return this.post(`/v1/devices/${options.device_id}/screen_capture`).then(() => {
            return;
        });
    }

    async screen(options) {
        return this.post(`/v1/devices/${options.device_id}/screen`).then((screen) => {
            return {
                image: screen.image
            };
        });
    }

    async custom_url(options) {
        return this.post(`/v1/devices/${options.device_id}/custom_url`, {
            url: url
        }).then(() => {
            return;
        });
    }
};

module.exports = client;