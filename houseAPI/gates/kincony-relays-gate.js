const config = require('../config/kincony-relays-config.json');
const net = require('net');
const { log } = require('console');
const { stat } = require('fs/promises');

// Creates REST object representing all kincony relay lines
async function getStatus()
{
        let houseBitmask = await getKinconyRelays(
                config.houseShuttersController.port, config.houseShuttersController.host);

        let garageBitmask = await getKinconyRelays(
                config.garageController.port, config.garageController.host);

        var status = require('../models/kincony-relays.json');

        status.Shutters.House.F1.W1 = houseBitmask & Number('0b0000000000000001');
        status.Shutters.House.F1.W2 = (houseBitmask & Number('0b0000000000000010')) >> 1;
        status.Shutters.House.F1.W3 = (houseBitmask & Number('0b0000000000000100')) >> 2;
        status.Shutters.House.F1.W4 = (houseBitmask & Number('0b0000000000001000')) >> 3;
        status.Shutters.House.F1.W5 = (houseBitmask & Number('0b0000000000010000')) >> 4;
        status.Shutters.House.F1.W6 = (houseBitmask & Number('0b0000000000100000')) >> 5;
        status.Shutters.House.F1.W7 = (houseBitmask & Number('0b0000000001000000')) >> 6;

        status.Shutters.House.F2.W1 = (houseBitmask & Number('0b0000000010000000')) >> 7;
        status.Shutters.House.F2.W2 = (houseBitmask & Number('0b0000000100000000')) >> 8;
        status.Shutters.House.F2.W3 = (houseBitmask & Number('0b0000001000000000')) >> 9;
        status.Shutters.House.F2.W4 = (houseBitmask & Number('0b0000010000000000')) >> 10;
        status.Shutters.House.F2.W5 = (houseBitmask & Number('0b0000100000000000')) >> 11;
        status.Shutters.House.F2.W6 = (houseBitmask & Number('0b0001000000000000')) >> 12;
        status.Shutters.House.F2.W7 = (houseBitmask & Number('0b0010000000000000')) >> 13;
        status.Shutters.House.F2.W8 = (houseBitmask & Number('0b0100000000000000')) >> 14;
        status.Shutters.House.F2.W9 = (houseBitmask & Number('0b1000000000000000')) >> 15;

        status.Shutters.Garage.W1 = garageBitmask & Number('0b0000000000000001');           // Window 1: SW1 (1)
        status.Shutters.Garage.W2 = (garageBitmask & Number('0b0000000000000100')) >> 2;    // Window 2: SW3 (3)
        status.Shutters.Garage.W3 = (garageBitmask & Number('0b0000000000010000')) >> 4;    // Windos 3: SW5 (5)

        return status;
}

// Updates kincony relay lines to the requested new state.
// statusUpdate object don't have to have to represent complete set of items but only a subset
async function updateStatus(statusUpdate)
{
        // combine all items from current and updated (as setKinconyRelays() needs all bits)
        let newStatus = await getStatus();
        if (statusUpdate.Shutters !== undefined && statusUpdate.Shutters.House !== undefined) {

                if (statusUpdate.Shutters.House.F1 !== undefined)
                        newStatus.Shutters.House.F1 = { ...newStatus.Shutters.House.F1, ...statusUpdate.Shutters.House.F1 };

                if (statusUpdate.Shutters.House.F2 !== undefined)
                        newStatus.Shutters.House.F2 = { ...newStatus.Shutters.House.F2, ...statusUpdate.Shutters.House.F2 };
        }

        if (statusUpdate.Shutters !== undefined && statusUpdate.Shutters.Garage !== undefined) {
                
                if (statusUpdate.Shutters.Garage !== undefined)
                        newStatus.Shutters.Garage = { ...newStatus.Shutters.Garage, ...statusUpdate.Shutters.Garage };

        }

        if (
                isNaN(newStatus.Shutters.House.F2.W9) || (newStatus.Shutters.House.F2.W9 != 0 && newStatus.Shutters.House.F2.W9 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W8) || (newStatus.Shutters.House.F2.W8 != 0 && newStatus.Shutters.House.F2.W8 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W7) || (newStatus.Shutters.House.F2.W7 != 0 && newStatus.Shutters.House.F2.W7 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W6) || (newStatus.Shutters.House.F2.W6 != 0 && newStatus.Shutters.House.F2.W6 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W5) || (newStatus.Shutters.House.F2.W5 != 0 && newStatus.Shutters.House.F2.W5 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W4) || (newStatus.Shutters.House.F2.W4 != 0 && newStatus.Shutters.House.F2.W4 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W3) || (newStatus.Shutters.House.F2.W3 != 0 && newStatus.Shutters.House.F2.W3 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W2) || (newStatus.Shutters.House.F2.W2 != 0 && newStatus.Shutters.House.F2.W2 != 1) ||
                isNaN(newStatus.Shutters.House.F2.W1) || (newStatus.Shutters.House.F2.W1 != 0 && newStatus.Shutters.House.F2.W1 != 1) ||

                isNaN(newStatus.Shutters.House.F1.W7) || (newStatus.Shutters.House.F1.W7 != 0 && newStatus.Shutters.House.F1.W7 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W6) || (newStatus.Shutters.House.F1.W6 != 0 && newStatus.Shutters.House.F1.W6 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W5) || (newStatus.Shutters.House.F1.W5 != 0 && newStatus.Shutters.House.F1.W5 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W4) || (newStatus.Shutters.House.F1.W4 != 0 && newStatus.Shutters.House.F1.W4 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W3) || (newStatus.Shutters.House.F1.W3 != 0 && newStatus.Shutters.House.F1.W3 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W2) || (newStatus.Shutters.House.F1.W2 != 0 && newStatus.Shutters.House.F1.W2 != 1) ||
                isNaN(newStatus.Shutters.House.F1.W1) || (newStatus.Shutters.House.F1.W1 != 0 && newStatus.Shutters.House.F1.W1 != 1) ||

                isNaN(newStatus.Shutters.Garage.W1) || (newStatus.Shutters.Garage.W1 != 0 && newStatus.Shutters.Garage.W1 !=1) ||
                isNaN(newStatus.Shutters.Garage.W2) || (newStatus.Shutters.Garage.W2 != 0 && newStatus.Shutters.Garage.W2 !=1) ||
                isNaN(newStatus.Shutters.Garage.W3) || (newStatus.Shutters.Garage.W3 != 0 && newStatus.Shutters.Garage.W3 !=1)
        )
                return Promise.reject('Invalid status requested.');

        let houseBitmask =
                newStatus.Shutters.House.F2.W9 << 15 |
                newStatus.Shutters.House.F2.W8 << 14 |
                newStatus.Shutters.House.F2.W7 << 13 |
                newStatus.Shutters.House.F2.W6 << 12 |
                newStatus.Shutters.House.F2.W5 << 11 |
                newStatus.Shutters.House.F2.W4 << 10 |
                newStatus.Shutters.House.F2.W3 << 9 |
                newStatus.Shutters.House.F2.W2 << 8 |
                newStatus.Shutters.House.F2.W1 << 7 |

                newStatus.Shutters.House.F1.W7 << 6 |
                newStatus.Shutters.House.F1.W6 << 5 |
                newStatus.Shutters.House.F1.W5 << 4 |
                newStatus.Shutters.House.F1.W4 << 3 |
                newStatus.Shutters.House.F1.W3 << 2 |
                newStatus.Shutters.House.F1.W2 << 1 |
                newStatus.Shutters.House.F1.W1;

        let garageBitmask =
                newStatus.Shutters.Garage.W3 << 4 |      // Window 3: SW5 (5)
                newStatus.Shutters.Garage.W2 << 2 |      // Window 2: SW3 (3)
                newStatus.Shutters.Garage.W1             // Window 1: SW1 (1)

        return Promise.all([
                setKinconyRelays(config.houseShuttersController.port, config.houseShuttersController.host, houseBitmask),
                setKinconyRelays(config.garageController.port, config.garageController.host, garageBitmask)
        ]);
}

// Read all Relays' states
async function getKinconyRelays(kinconyPort, kinconyHost)
{
        return new Promise((resolved, rejected) => {
                let client = net.createConnection(kinconyPort, kinconyHost, () => {
                        client.write('RELAY-STATE-255');

                        let result = '';

                        client.on('data', (data) => {
                                result += data;

                                // relay board will send 0 at the end of the responce
                                if (data[data.length-1] == 0)
                                {
                                        client.destroy();
                                        // Successful result looks like: RELAY-STATE-255,0,2,OK
                                        let list = result.split(',');
                                        if (list[0] == 'RELAY-STATE-255' && list[3].startsWith('OK'))
                                                resolved((list[1] << 8) | list[2]);
                                        else
                                                rejected(result);
                                }
                        });
                });
        });
}

// Set multiple relays
async function setKinconyRelays(kinconyPort, kinconyHost, bitmask)
{
        // first, validate input
        if (isNaN(bitmask) || bitmask < 0 || bitmask > Number('0xFFFF'))
                return Promise.reject('Invalid status requested.');

        return new Promise((resolved, rejected) => {
                let client = net.createConnection(kinconyPort, kinconyHost, () => {
                        let h = (bitmask & Number('0xFF00')) >> 8;
                        let l = bitmask & Number('0xFF');
                        client.write(`RELAY-SET_ALL-255,${h},${l}`);
                });

                let result = '';

                client.on('data', (data) => {

                        result += data;

                        // relay board will send 0 at the end of the responce
                        if (data[data.length-1] == 0)
                        {
                                client.destroy();
                                // Successful result looks like: RELAY-SET_ALL-255,D1,D0,OK
                                // console.log(result);
                                let list = result.split(',');
                                if (list[0] == 'RELAY-SET_ALL-255' && list[3].startsWith('OK'))
                                        resolved();
                                else
                                        rejected(result);
                        }
                });
        });
}

if (typeof exports !== 'undefined')
{
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
}