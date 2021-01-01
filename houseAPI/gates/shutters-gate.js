const config = require('../config/shutters-config.json');
const net = require('net');
const { log } = require('console');

// setAll(Number('0x00FF'));

// Creates REST object representing all shutters states
async function getStatus()
{
        let bitmask = await readAll();
        var status = require('../models/shutters.json');

        status.F1.W1 = bitmask & Number('0b0000000000000001');
        status.F1.W2 = (bitmask & Number('0b0000000000000010')) >> 1;
        status.F1.W3 = (bitmask & Number('0b0000000000000100')) >> 2;
        status.F1.W4 = (bitmask & Number('0b0000000000001000')) >> 3;
        status.F1.W5 = (bitmask & Number('0b0000000000010000')) >> 4;
        status.F1.W6 = (bitmask & Number('0b0000000000100000')) >> 5;
        status.F1.W7 = (bitmask & Number('0b0000000001000000')) >> 6;

        status.F2.W1 = (bitmask & Number('0b0000000010000000')) >> 7;
        status.F2.W2 = (bitmask & Number('0b0000000100000000')) >> 8;
        status.F2.W3 = (bitmask & Number('0b0000001000000000')) >> 9;
        status.F2.W4 = (bitmask & Number('0b0000010000000000')) >> 10;
        status.F2.W5 = (bitmask & Number('0b0000100000000000')) >> 11;
        status.F2.W6 = (bitmask & Number('0b0001000000000000')) >> 12;
        status.F2.W7 = (bitmask & Number('0b0010000000000000')) >> 13;
        status.F2.W8 = (bitmask & Number('0b0100000000000000')) >> 14;
        status.F2.W9 = (bitmask & Number('0b1000000000000000')) >> 15;

        return status;
}

// Updates shutters states to the requested new state
async function updateStatus(newStatus)
{
        if (
                isNaN(newStatus.F2.W9) || (newStatus.F2.W9 != 0 && newStatus.F2.W9 != 1) ||
                isNaN(newStatus.F2.W8) || (newStatus.F2.W8 != 0 && newStatus.F2.W8 != 1) ||
                isNaN(newStatus.F2.W7) || (newStatus.F2.W7 != 0 && newStatus.F2.W7 != 1) ||
                isNaN(newStatus.F2.W6) || (newStatus.F2.W6 != 0 && newStatus.F2.W6 != 1) ||
                isNaN(newStatus.F2.W5) || (newStatus.F2.W5 != 0 && newStatus.F2.W5 != 1) ||
                isNaN(newStatus.F2.W4) || (newStatus.F2.W4 != 0 && newStatus.F2.W4 != 1) ||
                isNaN(newStatus.F2.W3) || (newStatus.F2.W3 != 0 && newStatus.F2.W3 != 1) ||
                isNaN(newStatus.F2.W2) || (newStatus.F2.W2 != 0 && newStatus.F2.W2 != 1) ||
                isNaN(newStatus.F2.W1) || (newStatus.F2.W1 != 0 && newStatus.F2.W1 != 1) ||

                isNaN(newStatus.F1.W7) || (newStatus.F1.W7 != 0 && newStatus.F1.W7 != 1) ||
                isNaN(newStatus.F1.W6) || (newStatus.F1.W6 != 0 && newStatus.F1.W6 != 1) ||
                isNaN(newStatus.F1.W5) || (newStatus.F1.W5 != 0 && newStatus.F1.W5 != 1) ||
                isNaN(newStatus.F1.W4) || (newStatus.F1.W4 != 0 && newStatus.F1.W4 != 1) ||
                isNaN(newStatus.F1.W3) || (newStatus.F1.W3 != 0 && newStatus.F1.W3 != 1) ||
                isNaN(newStatus.F1.W2) || (newStatus.F1.W2 != 0 && newStatus.F1.W2 != 1) ||
                isNaN(newStatus.F1.W1) || (newStatus.F1.W1 != 0 && newStatus.F1.W1 != 1)
        )
                return Promise.reject('Invalid status requested.');

        let bitmask =
                newStatus.F2.W9 << 15 |
                newStatus.F2.W8 << 14 |
                newStatus.F2.W7 << 13 |
                newStatus.F2.W6 << 12 |
                newStatus.F2.W5 << 11 |
                newStatus.F2.W4 << 10 |
                newStatus.F2.W3 << 9 |
                newStatus.F2.W2 << 8 |
                newStatus.F2.W1 << 7 |

                newStatus.F1.W7 << 6 |
                newStatus.F1.W6 << 5 |
                newStatus.F1.W5 << 4 |
                newStatus.F1.W4 << 3 |
                newStatus.F1.W3 << 2 |
                newStatus.F1.W2 << 1 |
                newStatus.F1.W1;

        return setAll(bitmask);
}

// Read all Relays' status
async function readAll()
{
        return new Promise((resolved, rejected) => {
                let client = net.createConnection(config.port, config.host, () => {
                        client.write('RELAY-STATE-255');

                        let result = '';

                        client.on('data', (data) => {
                                result += data;

                                // relay board will send 0 at the end of the responce
                                if (data[data.length-1] == 0)
                                {
                                        client.end();
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
async function setAll(bitmask)
{
        // first, validate input
        if (isNaN(bitmask) || bitmask < 0 || bitmask > Number('0xFFFF'))
                return Promise.reject('Invalid status requested.');

        return new Promise((resolved, rejected) => {
                let client = net.createConnection(config.port, config.host, () => {
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
                                client.end();
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