var vitalchat = require('./index');
var client = new vitalchat({
	host: process.env.VITALCHAT_HOST,
	key: process.env.VITALCHAT_KEY,
	secret: process.env.VITALCHAT_SECRET,
});

client.on('event', (event) => {
	console.log(JSON.stringify(event, null, '\t'));
});

client.on('log', (log) => {
	console.log(JSON.stringify(log, null, '\t'));
});

client.on('error', (err) => {
	console.log(err);
});

(async () => {
	console.log('connecting to', process.env.VITALCHAT_HOST);
	var devices = await client.devices();
	console.log(devices);
	if (devices.length === 0) {
		console.log('no devices found');
		return;
	}
	await client.custom_url({
		device: devices[0].name,
		url: 'https://vitalchat.s3.amazonaws.com/cdn/images/careboard.html'
	});
})().catch((err) => {
	console.error(err);
});
