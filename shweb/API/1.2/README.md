# House API
# ShWade WebUI API Service
ReadMe WIP


# Installation

## Sensitive Information

Config folder is not included to git repository as it may have private information.
To deploy to the target environment:

```
$ cd shweb/API/1.2
$ scp -r config/ den@192.168.1.162:/home/den/Shden/shweb/API/1.2
```

## ShWade WebUI API Service Installation

Start from ShWade-webUI-API.service file in this directory. Check directories layout for everything 
(node, working directory). Then copy ShWade-webUI-API.service to /lib/systemd/system/:
```$ sudo cp ShWade-webUI-API.service /lib/systemd/system/```

Run this command:
```$ sudo systemctl daemon-reload```

Let SystemD know about the ShWade webUI API service and instruct SystemD to load this service on boot:
```$ sudo systemctl enable ShWade-webUI-API```

Now run the ShWade-webUI-API service:
```$ sudo systemctl start ShWade-webUI-API```

# ShWade WebUI API Service Operations

To see the status of the service:
```$ sudo systemctl status ShWade-webUI-API```

To restart:
```$ sudo systemctl restart ShWade-webUI-API```

To stop the service:
```$ sudo systemctl stop ShWade-webUI-API```

To disable the service (prevent it from loading on boot):
```$ sudo systemctl disable ShWade-webUI-API```

# Testing

From shweb directory run:

```$ npm run test_1.2 [test/gatewaysAPI-tests.js]```