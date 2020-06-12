# vitalchat-node

# Setup
```
var vitalchat = require('vitalchat');
var client = new vitalchat({
    host: '',
    key: '',
    secret: ''
});
```

# Get Devices
```
var devices = await client.devices();
console.log(devices);
```

# Make A Call
```
var data = await client.call({
    device_id: '',
    caller_id: '',
    action: 'knock'
});
console.log(data);
```

# Set Privacy Mode
```
await client.privacy({
    device_id: '',,
    privacy_till: new Date().getTime() + (5 * 60 * 1000) // 5 minutes in the future
});
```

# Capture Screen
```
await client.screen_capture({
    device_id: ''
});
```

# Get Last Screen Capture
```
var image = await client.screen({
    device_id: ''
});
console.log(image);
```

# Set Custom URL
```
await client.custom_url({
    device_id: ''
});
```

