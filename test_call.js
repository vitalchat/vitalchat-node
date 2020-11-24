var vitalchat = require('./index');
var client = new vitalchat({
    host: process.env.VITALCHAT_HOST,
    key: process.env.VITALCHAT_KEY,
    secret: process.env.VITALCHAT_SECRET
});

client.on('event', (event) => {
    console.log(JSON.stringify(event));
});

client.on('log', (log) => {
    console.log(JSON.stringify(log));
});

client.on('error', (err) => {
    console.log(err);
});

(async () => {
    console.log('connecting to', process.env.VITALCHAT_HOST);
    var devices = await client.devices();
    if (devices.length === 0) {
        console.log('no devices found');
        return;
    }
    var data = await client.call({
        device_id: devices[0].device_id,
        caller_id: 'test caller',
        action: 'knock'
    });
    console.log(JSON.stringify(data));
})().catch((err) => {
    console.error(err);
});
