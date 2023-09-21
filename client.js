const EventEmitter = require('events'),
	_ = require('lodash'),
	promise = require('bluebird'),
	crypto = require('crypto'),
	axios = require('axios'),
	moment = require('moment'),
	ws = require('ws');

class client extends EventEmitter {
	constructor(options) {
		super();
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

	async genenerateHMAC(body) {
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
			consumer_id,
		});
	}

	async get(route) {
		return this.genenerateHMAC().then((hmac) => {
			return axios({
				url: `${this.host}/integration${route}`,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Consumer-ID': hmac.consumer_id,
					'Counter': hmac.counter,
					'Signature-Type': hmac.type,
					'Signature': hmac.signature,
					'User-Agent': '',
				},
				responseType: 'json',
			})
				.then((response) => {
					return response.data;
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	async post(route, body) {
		return this.genenerateHMAC(body).then((hmac) => {
			return axios({
				url: `${this.host}/integration${route}`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Consumer-ID': hmac.consumer_id,
					'Counter': hmac.counter,
					'Signature-Type': hmac.type,
					'Signature': hmac.signature,
					'User-Agent': '',
				},
				data: body,
				responseType: 'json',
			})
				.then((response) => {
					return response.data;
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	listen() {
		this.startWebSockets();
	}

	startWebSockets() {
		this.checkWebSocketInterval = setInterval(this.checkWebSocket, 60 * 1000);
		this.connect();
	}

	checkWebSocket() {
		if (this.lastPing) {
			var minsAgo = moment().diff(moment(this.lastPing), 'minutes');
			if (minsAgo > 2) {
				this.connect();
			}
		}
	}

	async connect() {
		this.emit('log', 'connecting...');
		// Indicate intent to stay connected
		this.shouldReconnect = true;
		this.lastPing = new Date().getTime();

		// close current socket if already open
		this.closeSocket();

		// setup socket connection
		var hmac = await this.genenerateHMAC();
		this.websocket = new ws(`wss://${this.host.replace('https://', '')}/integration/events`, {
			headers: {
				'Consumer-ID': hmac.consumer_id,
				'Counter': hmac.counter,
				'Signature-Type': hmac.type,
				'Signature': hmac.signature,
			},
		});

		// Listen for connection opened
		this.websocket.on('open', () => {
			this.emit('log', 'connected');
		});

		this.websocket.on('ping', () => {
			this.lastPing = new Date().getTime();
			this.lastPingSuccess = new Date().getTime();
		});

		// Listen for connection closed
		this.websocket.on('close', () => {
			this.emit('log', 'closed');
			this.isListening = false;
			this.reconnect();
		});

		// Listen for errors
		this.websocket.on('error', (err) => {
			this.emit('error', err);
			this.reconnect();
		});

		// Listen for messages
		this.websocket.on('message', (data) => {
			const events = JSON.parse(data);
			_.each(events, (event) => {
				this.emit('event', event);
			});
		});

		// Check for connection regularly, just in case
		this.emit('log', 'waiting before trying to reconnect...');
		this.connectionIntervalHandle = setInterval(() => {
			this.reconnect();
		}, 1 * 60 * 60 * 1000);
	}

	disconnect() {
		// Indicate intent to not stay connected
		this.shouldReconnect = false;

		// Close socket
		this.closeSocket();
	}

	isConnected() {
		return this.websocket && this.websocket.readyState === 1;
	}

	closeSocket() {
		// Cancel timeouts
		clearInterval(this.connectionIntervalHandle);
		clearTimeout(this.reconnectTimoutHandle);
		this.connectionIntervalHandle = null;
		this.reconnectTimoutHandle = null;

		if (this.isConnected()) {
			this.websocket.close();
			this.websocket = null;
		}
	}

	reconnect() {
		if (!this.shouldReconnect || this.isConnected() || this.reconnectTimoutHandle) {
			return;
		}
		this.closeSocket();

		this.reconnectTimoutHandle = setTimeout(() => {
			this.connect();
		}, 10 * 1000);
	}

	async devices() {
		return this.get('/v1/devices').then((devices) => {
			return devices;
		});
	}

	async enter(options) {
		return this.post(`/v1/devices/${options.device}/enter`, {
			name: options.name,
			device_description: options.device_description,
		}).then((data) => {
			return data;
		});
	}

	async privacy(options) {
		return this.post(`/v1/devices/${options.device}/privacy`, {
			privacy: options.privacy,
		}).then(() => {
			return;
		});
	}

	async screen_capture(options) {
		return this.post(`/v1/devices/${options.device_id}/screen_capture`).then(() => {
			return;
		});
	}

	async hangup(options) {
		return this.post(`/v1/devices/${options.device_id}/hangup`).then(() => {
			return;
		});
	}

	async screen(options) {
		return this.post(`/v1/devices/${options.device_id}/screen`).then((screen) => {
			return {
				image: screen.image,
			};
		});
	}

	async custom_url(options) {
		return this.post(`/v1/devices/${options.device}/custom_url`, {
			url: options.url,
		}).then(() => {
			return;
		});
	}

	async custom_url_window_location(options) {
		return this.post(`/v1/devices/${options.device}/custom_url_window_location`, {
			left: options.left,
			top: options.top,
			width: options.width,
			height: options.height,
		}).then(() => {
			return;
		});
	}

	async reset(options) {
		return this.post(`/v1/devices/${options.device}/reset`, {}).then(() => {
			return;
		});
	}

	async meeting_link(options) {
		return this.post(`/v1/direct/meetings/create`, {}).then((data) => {
			return data;
		});
	}

	async join(options) {
		return this.post(`/v1/meetings/join`, options).then((data) => {
			return data;
		});
	}

	async invite(options) {
		return this.post(`/v1/devices/${options.device}/invites/add`, {}).then((data) => {
			return data;
		});
	}

	async invite_delete(options) {
		return this.post(`/v1/devices/${options.device}/invites/delete`, {}).then((data) => {
			return data;
		});
	}

	async invite_clear(options) {
		return this.post(`/v1/devices/${options.device}/invites/clear`, {}).then((data) => {
			return data;
		});
	}

	async observe(options) {
		return this.post(`/v1/devices/${options.device}/observe`, {
			device_description: options.device_description,
		}).then((data) => {
			return data;
		});
	}
}

module.exports = client;
