# vitalchat-node

## Setup

```
var vitalchat = require('vitalchat');
var client = new vitalchat({
    host: '',
    key: '',
    secret: ''
});
```

## Get Devices

```
var devices = await client.devices();
console.log(devices);
```

## Get Link To Enter Room

```
var data = await client.enter({
    device: '',
    name: '',
});
console.log(data);
```

## Set Privacy Mode

```
await client.privacy({
    device: '',,
    privacy_till: new Date().getTime() + (5 * 60 * 1000) // 5 minutes in the future
});
```

## Capture Screen

```
await client.screen_capture({
    device: ''
});
```

## Get Last Screen Capture

```
var image = await client.screen({
    device: ''
});
console.log(image);
```

## Set Custom URL

```
await client.custom_url({
    device: '',
    url: 'https://google.com',
    left: '0',
    top: '0',
    width: '0',
    height: '0',
});
```

## Set Custom URL

```
await client.custom_url({
    device: '',
    url: 'https://google.com',
});
```

## Set Custom URL Call Window Location

```
await client.custom_url_window_location({
    device: '',
    left: '0',
    top: '0',
    width: '0',
    height: '0',
});
```

## Subscribe to Events

```
client.on('event', (event)=>{
 console.log(event);
});
client.listen();
```
