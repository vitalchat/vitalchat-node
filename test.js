
var vitalchat = require('./index');
var client = new vitalchat({
    host: process.env.VITALCHAT_HOST,
    key: process.env.VITALCHAT_KEY,
    secret: process.env.VITALCHAT_SECRET
});

client.on('event', (event) => {
    console.log(event);
});

client.on('log', (log) => {
    console.log(log);
});

client.on('error', (err) => {
    console.log(err);
});

(async () => {
    client.listen();
    var devices = await client.devices();
    console.log(devices);
    var data = await client.call({
        device_id: devices[0].device_id,
        caller_id: 'test caller',
        action: 'knock'
    });
    console.log(data);
})().catch((err) => {
    console.error(err);
});
