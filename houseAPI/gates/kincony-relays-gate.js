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

        // -- get data model for state
        var status = require('../models/kincony-relays.json');

        // -- get house shutters
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

        // -- get garage shutters
        status.Shutters.Garage.W1 = garageBitmask & Number('0b0000000000000001');           // Window 1: SW1 (1)
        status.Shutters.Garage.W2 = (garageBitmask & Number('0b0000000000000100')) >> 2;    // Window 2: SW3 (3)
        status.Shutters.Garage.W3 = (garageBitmask & Number('0b0000000000010000')) >> 4;    // Windos 3: SW5 (5)

        // -- get garage relays
        status.Relays.Garage.R1 = (garageBitmask & Number('0b0000000000000010')) >> 1;      // Relay 1: SW2 (2)
        status.Relays.Garage.R2 = (garageBitmask & Number('0b0000000000001000')) >> 3;      // Relay 2: SW2 (4)
        status.Relays.Garage.R3 = (garageBitmask & Number('0b0000000000100000')) >> 5;      // Relay 3: SW6 (6)
        status.Relays.Garage.R4 = (garageBitmask & Number('0b0000000001000000')) >> 6;      // Relay 4: SW7 (7)
        status.Relays.Garage.R5 = (garageBitmask & Number('0b0000000010000000')) >> 7;      // Relay 5: SW7 (8)
        status.Relays.Garage.R6 = (garageBitmask & Number('0b0000000100000000')) >> 8;      // Relay 6: SW7 (9)
        status.Relays.Garage.R7 = (garageBitmask & Number('0b0000001000000000')) >> 9;      // Relay 7: SW7 (10)
        status.Relays.Garage.R8 = (garageBitmask & Number('0b0000010000000000')) >> 10;     // Relay 8: SW7 (11)
        status.Relays.Garage.R9 = (garageBitmask & Number('0b0000100000000000')) >> 11;     // Relay 9: SW7 (12)
        status.Relays.Garage.R10 = (garageBitmask & Number('0b0001000000000000')) >> 12;    // Relay 10: SW7 (13)
        status.Relays.Garage.R11 = (garageBitmask & Number('0b0010000000000000')) >> 13;    // Relay 11: SW7 (14)
        status.Relays.Garage.R12 = (garageBitmask & Number('0b0100000000000000')) >> 14;    // Relay 12: SW7 (15)
        status.Relays.Garage.R13 = (garageBitmask & Number('0b1000000000000000')) >> 15;    // Relay 13: SW7 (16)
        
        return status;
}

// Updates kincony relay lines to the requested new state.
// statusUpdate object don't have to have to represent complete set of items but only a subset
async function updateStatus(statusUpdate)
{
        // combine all items from current and updated (as setKinconyRelays() needs all bits)
        let newStatus = await getStatus();
        if (statusUpdate.Shutters !== undefined) {
                
                if (statusUpdate.Shutters.House !== undefined) {

                        if (statusUpdate.Shutters.House.F1 !== undefined)
                                newStatus.Shutters.House.F1 = { ...newStatus.Shutters.House.F1, ...statusUpdate.Shutters.House.F1 };

                        if (statusUpdate.Shutters.House.F2 !== undefined)
                                newStatus.Shutters.House.F2 = { ...newStatus.Shutters.House.F2, ...statusUpdate.Shutters.House.F2 };
                }

                if (statusUpdate.Shutters.Garage !== undefined) {
                        newStatus.Shutters.Garage = { ...newStatus.Shutters.Garage, ...statusUpdate.Shutters.Garage };
                }
        }

        if (statusUpdate.Relays !== undefined) {

                if (statusUpdate.Relays.Garage !== undefined)
                        newStatus.Relays.Garage = { ...newStatus.Relays.Garage, ...statusUpdate.Relays.Garage};
        } 

        const isInvalid = (value) => isNaN(value) || (value != 0 && value != 1);

        if (
                isInvalid(newStatus.Shutters.House.F2.W9) ||
                isInvalid(newStatus.Shutters.House.F2.W8) || 
                isInvalid(newStatus.Shutters.House.F2.W7) || 
                isInvalid(newStatus.Shutters.House.F2.W6) || 
                isInvalid(newStatus.Shutters.House.F2.W5) || 
                isInvalid(newStatus.Shutters.House.F2.W4) || 
                isInvalid(newStatus.Shutters.House.F2.W3) || 
                isInvalid(newStatus.Shutters.House.F2.W2) || 
                isInvalid(newStatus.Shutters.House.F2.W1) || 

                isInvalid(newStatus.Shutters.House.F1.W7) || 
                isInvalid(newStatus.Shutters.House.F1.W6) || 
                isInvalid(newStatus.Shutters.House.F1.W5) || 
                isInvalid(newStatus.Shutters.House.F1.W4) || 
                isInvalid(newStatus.Shutters.House.F1.W3) || 
                isInvalid(newStatus.Shutters.House.F1.W2) || 
                isInvalid(newStatus.Shutters.House.F1.W1) || 

                // -- left old way to see if above ^^^ works well, to be replaced after testing
                isNaN(newStatus.Shutters.Garage.W1) || (newStatus.Shutters.Garage.W1 != 0 && newStatus.Shutters.Garage.W1 != 1) ||
                isNaN(newStatus.Shutters.Garage.W2) || (newStatus.Shutters.Garage.W2 != 0 && newStatus.Shutters.Garage.W2 != 1) ||
                isNaN(newStatus.Shutters.Garage.W3) || (newStatus.Shutters.Garage.W3 != 0 && newStatus.Shutters.Garage.W3 != 1) ||

                isNaN(newStatus.Relays.Garage.R1) || (newStatus.Relays.Garage.R1 != 0 && newStatus.Relays.Garage.R1 != 1) ||
                isNaN(newStatus.Relays.Garage.R2) || (newStatus.Relays.Garage.R2 != 0 && newStatus.Relays.Garage.R2 != 1) ||
                isNaN(newStatus.Relays.Garage.R3) || (newStatus.Relays.Garage.R3 != 0 && newStatus.Relays.Garage.R3 != 1) ||
                isNaN(newStatus.Relays.Garage.R4) || (newStatus.Relays.Garage.R4 != 0 && newStatus.Relays.Garage.R4 != 1) ||
                isNaN(newStatus.Relays.Garage.R5) || (newStatus.Relays.Garage.R5 != 0 && newStatus.Relays.Garage.R5 != 1) ||
                isNaN(newStatus.Relays.Garage.R6) || (newStatus.Relays.Garage.R6 != 0 && newStatus.Relays.Garage.R6 != 1) ||
                isNaN(newStatus.Relays.Garage.R7) || (newStatus.Relays.Garage.R7 != 0 && newStatus.Relays.Garage.R7 != 1) ||
                isNaN(newStatus.Relays.Garage.R8) || (newStatus.Relays.Garage.R8 != 0 && newStatus.Relays.Garage.R8 != 1) ||
                isNaN(newStatus.Relays.Garage.R9) || (newStatus.Relays.Garage.R9 != 0 && newStatus.Relays.Garage.R9 != 1) ||
                isNaN(newStatus.Relays.Garage.R10) || (newStatus.Relays.Garage.R10 != 0 && newStatus.Relays.Garage.R10 != 1) ||
                isNaN(newStatus.Relays.Garage.R11) || (newStatus.Relays.Garage.R11 != 0 && newStatus.Relays.Garage.R11 != 1) ||
                isNaN(newStatus.Relays.Garage.R12) || (newStatus.Relays.Garage.R12 != 0 && newStatus.Relays.Garage.R12 != 1) ||
                isNaN(newStatus.Relays.Garage.R13) || (newStatus.Relays.Garage.R13 != 0 && newStatus.Relays.Garage.R13 != 1)
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
                newStatus.Shutters.Garage.W3 << 4 |     // Window 3: SW5 (5)
                newStatus.Shutters.Garage.W2 << 2 |     // Window 2: SW3 (3)
                newStatus.Shutters.Garage.W1 |          // Window 1: SW1 (1)

                newStatus.Relays.Garage.R1 << 1 |       // Relay 1: SW2 (2)
                newStatus.Relays.Garage.R2 << 3 |       // Relay 2: SW4 (4)
                newStatus.Relays.Garage.R3 << 5 |       // Relay 3: SW6 (6)
                
                newStatus.Relays.Garage.R4 << 6 |       // Relay 4: SW7 (7)
                newStatus.Relays.Garage.R5 << 7 |       // Relay 5: SW8 (8)
                newStatus.Relays.Garage.R6 << 8 |       // Relay 6: SW9 (9)
                newStatus.Relays.Garage.R7 << 9 |       // Relay 7: SW10 (10)
                newStatus.Relays.Garage.R8 << 10 |      // Relay 8: SW11 (11)
                newStatus.Relays.Garage.R9 << 11 |      // Relay 9: SW12 (12)
                newStatus.Relays.Garage.R10 << 12 |     // Relay 10: SW13 (13)
                newStatus.Relays.Garage.R11 << 13 |     // Relay 11: SW14 (14)
                newStatus.Relays.Garage.R12 << 14 |     // Relay 12: SW15 (15)
                newStatus.Relays.Garage.R13 << 15;      // Relay 13: SW16 (16)


        return Promise.all([
                setKinconyRelays(config.houseShuttersController.port, config.houseShuttersController.host, houseBitmask),
                setKinconyRelays(config.garageController.port, config.garageController.host, garageBitmask)
        ]);
}

// Read all Relays' states
// see https://www.kincony.com/download/KC868-Hx-Smart-Controller-Protocol-V20.0.1.pdf
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