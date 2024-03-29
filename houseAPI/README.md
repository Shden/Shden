# House API
# ShWade Thing Service
ReadMe WIP


# Installation

## Sensitive Information

Folders .keys and config are not included to git repository as they have private information.
To deploy to the target environment:

```
$ cd houseAPI
$ scp -r config/ den@192.168.1.162:/home/den/Shden/houseAPI
$ scp -r .keys/ den@192.168.1.162:/home/den/Shden/houseAPI
```

## ShWade Thing Service Installation

Start from shwade-thing.service file in this directory. Check directories layout for everything 
(node, working directory). Then copy shwade-thing.service to /lib/systemd/system/:
```$ sudo cp shwade-thing.service /lib/systemd/system/```

Run this command:
```$ sudo systemctl daemon-reload```

Let SystemD know about the shwade-thing service and instruct SystemD to load this service on boot:
```$ sudo systemctl enable shwade-thing```

Now run the shwade-thing service:
```$ sudo systemctl restart shwade-thing```

# ShWade Thing Service Operations

To see the status of the service:
```$ sudo systemctl status shwade-thing```

To restart the service:
```$ sudo systemctl restart shwade-thing```

To stop the service:
```$ sudo systemctl stop shwade-thing```

To disable the service (prevent it from loading on boot):
```$ sudo systemctl disable shwade-thing```

# Thing Service Testing

Tests can be run by:
```$ npm run test [test/testSuite.js]```

If [test/testSuite.js] is skipped, all tests are run. 

Please note: tests may change actual status of devices. Please read scripts before run.
