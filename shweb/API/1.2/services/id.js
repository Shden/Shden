/**
 * Serivce IDs.
 */

// house modes enumeration
const HouseMode = Object.freeze({ 
        LONGTERM_STANDBY : 0,
        PRESENCE_MODE : 1, 
        SHORTTERM_STANDBY : 2
});

if (typeof exports !== 'undefined')
{
        exports.HouseMode = HouseMode;
}