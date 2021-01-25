const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// house modes enumeration
const HouseMode = Object.freeze({ 
        LONGTERM_STANDBY : 0,
        PRESENCE_MODE : 1, 
        SHORTTERM_STANDY : 2
});

// Returns current house status
async function GetHouseStatus() 
{
        return houseAPI.getStatus();
}

// Change house presence mode
async function SetMode(newMode)
{
        let updateRequest = {
                oneWireStatus : {
                        switches : { }
                },
                config : { }
        };

         switch(newMode)
        {
                case HouseMode.PRESENCE_MODE:
                        // to presence
                        updateRequest.config.modeDesctiption = 'Присутствие';
                        updateRequest.config.modeId = HouseMode.PRESENCE_MODE;

                        updateRequest.oneWireStatus.switches.ultrasonicSwitch = 0;
                        updateRequest.oneWireStatus.switches.mainsSwitch = 1;
                        break;

                case HouseMode.LONGTERM_STANDBY:
                        // to longterm standby
                        updateRequest.config.modeDesctiption = 'Долгосрочное отсутсвие';
                        updateRequest.config.modeId = HouseMode.LONGTERM_STANDBY;

                        updateRequest.oneWireStatus.switches.streetLight250 = 0;
                        updateRequest.oneWireStatus.switches.ultrasonicSwitch = 1;
                        updateRequest.oneWireStatus.switches.mainsSwitch = 0;
                        updateRequest.oneWireStatus.switches.fenceLight = 0;
                        break;

                case HouseMode.SHORTTERM_STANDY:
                        // to shorterm standby
                        updateRequest.config.modeDesctiption = 'Непродолжительное отсутствие';
                        updateRequest.config.modeId = HouseMode.SHORTTERM_STANDY;

                        updateRequest.oneWireStatus.switches.streetLight250 = 0;
                        updateRequest.oneWireStatus.switches.ultrasonicSwitch = 1;
                        updateRequest.oneWireStatus.switches.mainsSwitch = 1;
                        // updateRequest.oneWireStatus.switches.fenceLight = 0;
                        break;
        }

        await houseAPI.updateStatus(updateRequest);
        return GetHouseStatus();
}

if (typeof exports !== 'undefined')
{
        exports.GetHouseStatus = GetHouseStatus;
        exports.SetMode = SetMode;
        exports.HouseMode = HouseMode;
}