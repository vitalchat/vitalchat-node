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
	var data = await client.join({
		meeting_id: 'test-1234',
		meeting_name: 'test meeting',
		name: 'John Smith'
	});
	console.log(JSON.stringify(data, null, '\t'));
})().catch((err) => {
	console.error(err);
});
