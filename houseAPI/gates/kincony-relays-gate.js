const config = require('../config/kincony-relays-config.json');
const net = require('net');
const { log } = require('console');
const { stat } = require('fs/promises');

// Creates REST object representing all kincony relay lines
async function getStatus()
{
        let houseShuttersBitmask = await getKinconyRelays(
                config.houseShuttersController.port, 
                config.houseShuttersController.host, 
                config.houseShuttersController.channels);

        let garageBitmask = await getKinconyRelays(
                config.garageController.port, 
                config.garageController.host, 
                config.garageController.channels);

        let houseMainFuseBoxBitmask = await getKinconyRelays(
                config.houseMainFuseBoxController.port,
                config.houseMainFuseBoxController.host,
                config.houseMainFuseBoxController.channels);

        // -- get data model for state
        var status = require('../models/kincony-relays.json');

        // -- get house shutters
        status.Shutters.House.F1.W1 = houseShuttersBitmask & Number('0b0000000000000001');
        status.Shutters.House.F1.W2 = (houseShuttersBitmask & Number('0b0000000000000010')) >> 1;
        status.Shutters.House.F1.W3 = (houseShuttersBitmask & Number('0b0000000000000100')) >> 2;
        status.Shutters.House.F1.W4 = (houseShuttersBitmask & Number('0b0000000000001000')) >> 3;
        status.Shutters.House.F1.W5 = (houseShuttersBitmask & Number('0b0000000000010000')) >> 4;
        status.Shutters.House.F1.W6 = (houseShuttersBitmask & Number('0b0000000000100000')) >> 5;
        status.Shutters.House.F1.W7 = (houseShuttersBitmask & Number('0b0000000001000000')) >> 6;

        status.Shutters.House.F2.W1 = (houseShuttersBitmask & Number('0b0000000010000000')) >> 7;
        status.Shutters.House.F2.W2 = (houseShuttersBitmask & Number('0b0000000100000000')) >> 8;
        status.Shutters.House.F2.W3 = (houseShuttersBitmask & Number('0b0000001000000000')) >> 9;
        status.Shutters.House.F2.W4 = (houseShuttersBitmask & Number('0b0000010000000000')) >> 10;
        status.Shutters.House.F2.W5 = (houseShuttersBitmask & Number('0b0000100000000000')) >> 11;
        status.Shutters.House.F2.W6 = (houseShuttersBitmask & Number('0b0001000000000000')) >> 12;
        status.Shutters.House.F2.W7 = (houseShuttersBitmask & Number('0b0010000000000000')) >> 13;
        status.Shutters.House.F2.W8 = (houseShuttersBitmask & Number('0b0100000000000000')) >> 14;
        status.Shutters.House.F2.W9 = (houseShuttersBitmask & Number('0b1000000000000000')) >> 15;

        // -- get house main fusebox relays:
        /* R1 --------------> */ status.Relays.House.MainFuseBox.R1_1LP = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000000001')) >> 0;
        /* R2 --------------> */ status.Relays.House.MainFuseBox.R2_1LL = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000000010')) >> 1;
        /* R3 --------------> */ status.Relays.House.MainFuseBox.R3_1LS = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000000100')) >> 2;
        /* R4 --------------> */ status.Relays.House.MainFuseBox.R4_1RL = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000001000')) >> 3;
        /* R5 --------------> */ status.Relays.House.MainFuseBox.R5_1RS = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000010000')) >> 4;
        /* R6 --------------> */ status.Relays.House.MainFuseBox.R6_2LP = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000000100000')) >> 5;
        /* R7 --------------> */ status.Relays.House.MainFuseBox.R7_2LL = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000001000000')) >> 6;
        /* R8 --------------> */ status.Relays.House.MainFuseBox.R8_2RP = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000010000000')) >> 7;
        /* R9 --------------> */ status.Relays.House.MainFuseBox.R9_2RL = (houseMainFuseBoxBitmask & Number('0b00000000000000000000000100000000')) >> 8;
        /* R10 ------------> */ status.Relays.House.MainFuseBox.R10_2RS = (houseMainFuseBoxBitmask & Number('0b00000000000000000000001000000000')) >> 9;
        /* R11 ----------> */ status.Relays.House.MainFuseBox.R11_Gates = (houseMainFuseBoxBitmask & Number('0b00000000000000000000010000000000')) >> 10;
        /* R12 -----> */ status.Relays.House.MainFuseBox.R12_fenceLight = (houseMainFuseBoxBitmask & Number('0b00000000000000000000100000000000')) >> 11;
        /* R13 ----> */ status.Relays.House.MainFuseBox.R13_facadeLight = (houseMainFuseBoxBitmask & Number('0b00000000000000000001000000000000')) >> 12;
        /* R14 ----> */ status.Relays.House.MainFuseBox.R14_gardenLight = (houseMainFuseBoxBitmask & Number('0b00000000000000000010000000000000')) >> 13;
        /* R15 -> */ status.Relays.House.MainFuseBox.R15_streetLight250 = (houseMainFuseBoxBitmask & Number('0b00000000000000000100000000000000')) >> 14;
        /* R16 ---> */ status.Relays.House.MainFuseBox.R16_KM3_Presence = (houseMainFuseBoxBitmask & Number('0b00000000000000001000000000000000')) >> 15;
        // status.Relays.House.MainFuseBox.R17 = (houseMainFuseBoxBitmask & Number('0b00000000000000010000000000000000')) >> 16;

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

                if (statusUpdate.Shutters.Garage !== undefined) 
                        newStatus.Shutters.Garage = { ...newStatus.Shutters.Garage, ...statusUpdate.Shutters.Garage };
        }

        if (statusUpdate.Relays !== undefined) {

                if (statusUpdate.Relays.Garage !== undefined)
                        newStatus.Relays.Garage = { ...newStatus.Relays.Garage, ...statusUpdate.Relays.Garage};

                if (statusUpdate.Relays.House !== undefined && statusUpdate.Relays.House.MainFuseBox !== undefined)
                        newStatus.Relays.House.MainFuseBox = { ...newStatus.Relays.House.MainFuseBox, ...statusUpdate.Relays.House.MainFuseBox}
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

                isInvalid(newStatus.Shutters.Garage.W1) || 
                isInvalid(newStatus.Shutters.Garage.W2) || 
                isInvalid(newStatus.Shutters.Garage.W3) || 

                isInvalid(newStatus.Relays.Garage.R1) ||
                isInvalid(newStatus.Relays.Garage.R2) ||
                isInvalid(newStatus.Relays.Garage.R3) ||
                isInvalid(newStatus.Relays.Garage.R4) ||
                isInvalid(newStatus.Relays.Garage.R5) ||
                isInvalid(newStatus.Relays.Garage.R6) ||
                isInvalid(newStatus.Relays.Garage.R7) ||
                isInvalid(newStatus.Relays.Garage.R8) ||
                isInvalid(newStatus.Relays.Garage.R9) ||
                isInvalid(newStatus.Relays.Garage.R10) ||
                isInvalid(newStatus.Relays.Garage.R11) ||
                isInvalid(newStatus.Relays.Garage.R12) ||
                isInvalid(newStatus.Relays.Garage.R13) ||

                isInvalid(newStatus.Relays.House.MainFuseBox.R1_1LP) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R2_1LL) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R3_1LS) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R4_1RL) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R5_1RS) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R6_2LP) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R7_2LL) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R8_2RP) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R9_2RL) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R10_2RS) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R11_Gates) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R12_fenceLight) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R13_facadeLight) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R14_gardenLight) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R15_streetLight250) ||
                isInvalid(newStatus.Relays.House.MainFuseBox.R16_KM3_Presence) //||
                // isInvalid(newStatus.Relays.House.MainFuseBox.R17)
        )
                return Promise.reject('Invalid status requested.');

        let houseShuttersBitmask =
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

        let houseMainFuseBoxBitmask =
                newStatus.Relays.House.MainFuseBox.R1_1LP /* <----------------- */ |
                newStatus.Relays.House.MainFuseBox.R2_1LL /* <----------------- */ << 1 |
                newStatus.Relays.House.MainFuseBox.R3_1LS /* <----------------- */ << 2 |
                newStatus.Relays.House.MainFuseBox.R4_1RL /* <----------------- */ << 3 |
                newStatus.Relays.House.MainFuseBox.R5_1RS /* <----------------- */ << 4 |
                newStatus.Relays.House.MainFuseBox.R6_2LP /* <----------------- */ << 5 |
                newStatus.Relays.House.MainFuseBox.R7_2LL /* <----------------- */ << 6 |
                newStatus.Relays.House.MainFuseBox.R8_2RP /* <----------------- */ << 7 |
                newStatus.Relays.House.MainFuseBox.R9_2RL /* <----------------- */ << 8 |
                newStatus.Relays.House.MainFuseBox.R10_2RS /* <---------------- */ << 9 |
                newStatus.Relays.House.MainFuseBox.R11_Gates /* <-------------- */ << 10 |
                newStatus.Relays.House.MainFuseBox.R12_fenceLight /* <--------- */ << 11 |
                newStatus.Relays.House.MainFuseBox.R13_facadeLight /* <-------- */ << 12 |
                newStatus.Relays.House.MainFuseBox.R14_gardenLight /* <-------- */ << 13 |
                newStatus.Relays.House.MainFuseBox.R15_streetLight250 /* <----- */ << 14 |
                newStatus.Relays.House.MainFuseBox.R16_KM3_Presence /* <------- */ << 15; //|
                // newStatus.Relays.House.MainFuseBox.R17 << 16;

        return Promise.all([
                setKinconyRelays(config.houseShuttersController.port, 
                        config.houseShuttersController.host, config.houseShuttersController.channels, houseShuttersBitmask),
                setKinconyRelays(config.garageController.port, 
                        config.garageController.host, config.garageController.channels, garageBitmask),
                setKinconyRelays(config.houseMainFuseBoxController.port,
                        config.houseMainFuseBoxController.host, config.houseMainFuseBoxController.channels, houseMainFuseBoxBitmask)
        ]);
}

// Read all Relays' states
// see https://www.kincony.com/download/KC868-Hx-Smart-Controller-Protocol-V20.0.1.pdf
async function getKinconyRelays(kinconyPort, kinconyHost, kinconyChannels)
{
        if (kinconyChannels !== 16 && kinconyChannels !== 32)
                return Promise.reject(`Invalid channels number: ${kinconyChannels}`);

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
                                        let list = result.split(',');

                                        switch (kinconyChannels) {
                                                case 16:
                                                        // Successful result looks like: RELAY-STATE-255,0,2,OK
                                                        if (list[0] == 'RELAY-STATE-255' && list[3].startsWith('OK'))
                                                                resolved((list[1] << 8) | list[2]);
                                                        else 
                                                                rejected(result);
                                                        break;
                                        
                                                case 32:
                                                        /* Successful result looks like: 
                                                                RELAY-STATE-255,D3,D2,D1,D0,OK - Read successed
                                                                RELAY-STATE-255,D3,D2,D1,D0,ERROR - Read failed
                                                        */
                                                        if (list[0] == 'RELAY-STATE-255' && list[5].startsWith('OK'))
                                                                resolved((list[1] << 24) | list[2] << 16 | list[3] << 8 | list[4]);
                                                        else
                                                                rejected(result);
                                                        break;
                                        }
                                }
                        });
                });
        });
}

// Set multiple relays
async function setKinconyRelays(kinconyPort, kinconyHost, kinconyChannels, bitmask)
{
        // first, validate input
        if (isNaN(bitmask))
                return Promise.reject('Invalid status requested.');

        if (kinconyChannels !== 16 && kinconyChannels !== 32)
                return Promise.reject(`Invalid channels number: ${kinconyChannels}`);

        return new Promise((resolved, rejected) => {
                let client = net.createConnection(kinconyPort, kinconyHost, () => {
                        switch (kinconyChannels) {
                                case 16:
                                        // RELAY-SET_ALL-255,D1,D0
                                        let h = (bitmask & Number('0xFF00')) >> 8;
                                        let l = bitmask & Number('0xFF');
                                        client.write(`RELAY-SET_ALL-255,${h},${l}`);
                                        break;

                                case 32:
                                        // RELAY-SET_ALL-255,D3,D2,D1,D0
                                        let hh = (bitmask & Number('0xFF000000')) >> 24;
                                        let lh = (bitmask & Number('0x00FF0000')) >> 16;
                                        let hl = (bitmask & Number('0xFF00')) >> 8;
                                        let ll = bitmask & Number('0xFF');
                                        client.write(`RELAY-SET_ALL-255,${hh},${lh},${hl},${ll}`);
                                        break;
                        }
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
                                switch (kinconyChannels) {
                                        case 16:
                                                if (list[0] == 'RELAY-SET_ALL-255' && list[3].startsWith('OK'))
                                                        resolved();
                                                else
                                                        rejected(result);
                                                break;
                                
                                        case 32:
                                                if (list[0] == 'RELAY-SET_ALL-255' && list[5].startsWith('OK'))
                                                        resolved();
                                                else
                                                        rejected(result);
                                                break;
                                }
                        }
                });
        });
}

if (typeof exports !== 'undefined')
{
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
}