const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');
const climateService = require('./climate');
const HouseMode = require('./id').HouseMode;

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current house status
async function GetHouseStatus() 
{
        return houseAPI.getStatus();
}

// Change house presence mode
async function SetMode(newMode)
{
        let updateRequest = new HouseState().gotoMode(newMode).updateRequest;
        // climate changes goes from climate service - apply the same pattern elsewhere
        updateRequest.config.heating = (await climateService.GetModeChangeUpdate(newMode)).config.heating;
        return houseAPI.updateStatus(updateRequest);
}

// Creates update request for typical house statuses or actions
class HouseState  
{
        updateRequest = new Object();

        gotoMode(toMode)
        {
                if (this.updateRequest.config === undefined) 
                        this.updateRequest.config = new Object();
                if (this.updateRequest.config.heating === undefined)
                        this.updateRequest.config.heating = new Object();
                if (this.updateRequest.oneWireStatus === undefined)
                        this.updateRequest.oneWireStatus = new Object();
                if (this.updateRequest.oneWireStatus.switches === undefined)
                        this.updateRequest.oneWireStatus.switches = new Object();

                switch(toMode)
                {
                        case HouseMode.PRESENCE_MODE:
                                // to presence
                                this.updateRequest.config.modeDescription = 'Presence mode';
                                this.updateRequest.config.modeId = HouseMode.PRESENCE_MODE;
        
                                this.updateRequest.oneWireStatus.switches.ultrasonicSwitch = 0;
                                this.updateRequest.oneWireStatus.switches.mainsSwitch = 1;

                                this.homeOpenShutters(1).homeOpenShutters(2).garageOpenShutters();

                                break;
        
                        case HouseMode.LONGTERM_STANDBY:
                                // to longterm standby
                                this.updateRequest.config.modeDescription = 'Long standby';
                                this.updateRequest.config.modeId = HouseMode.LONGTERM_STANDBY;
        
                                this.updateRequest.oneWireStatus.switches.streetLight250 = 0;
                                this.updateRequest.oneWireStatus.switches.ultrasonicSwitch = 1;
                                this.updateRequest.oneWireStatus.switches.mainsSwitch = 0;

                                this.allLightsOff().homeCloseShutters(1).homeCloseShutters(2).garageCloseShutters();

                                break;
        
                        case HouseMode.SHORTTERM_STANDBY:
                                // to shorterm standby
                                this.updateRequest.config.modeDescription = 'Short standby';
                                this.updateRequest.config.modeId = HouseMode.SHORTTERM_STANDBY;
        
                                this.updateRequest.oneWireStatus.switches.streetLight250 = 0;
                                this.updateRequest.oneWireStatus.switches.ultrasonicSwitch = 1;
                                this.updateRequest.oneWireStatus.switches.mainsSwitch = 1;

                                this.allLightsOff().homeCloseShutters(1).garageCloseShutters();
                                break;
                }

                return this;
        }

        allLightsOff()
        {
                if (this.updateRequest.zigbee === undefined) 
                        this.updateRequest.zigbee = new Object();
                if (this.updateRequest.zigbee.switches === undefined)
                        this.updateRequest.zigbee.switches = new Object();

                this.updateRequest.zigbee.switches.balconyLight = 0;
                this.updateRequest.zigbee.switches.streetLight150 = 0;
                this.updateRequest.zigbee.switches.kitchenOverheadsLight = 0;
                this.updateRequest.zigbee.switches.stairwayLight = 0;
                this.updateRequest.zigbee.switches.pantryOverheadsLight = 0;
                this.updateRequest.zigbee.switches.hallwayOverheadsLight = 0;
                this.updateRequest.zigbee.switches.hallwayTambourOverheadsLight = 0;
                this.updateRequest.zigbee.switches.porchOverheadsLight = 0;
                this.updateRequest.zigbee.switches.hall1OverheadsMainLight = 0;
                this.updateRequest.zigbee.switches.hall1OverheadsExtraLight = 0;
                this.updateRequest.zigbee.switches.alyaCabinetOverheadsLight = 0;
                this.updateRequest.zigbee.switches.dressingRoomOverheadsLight = 0;
                this.updateRequest.zigbee.switches.ourBedroomOverheadsLight = 0;
                this.updateRequest.zigbee.switches.smallChildrenRoomOverheadsLight = 0;
                this.updateRequest.zigbee.switches.colivingTambourOverheadsLight = 0;
                this.updateRequest.zigbee.switches.colivingOverheadsLight = 0;
                this.updateRequest.zigbee.switches.biggerChildrenRoomOverheadsLight1 = 0;
                this.updateRequest.zigbee.switches.biggerChildrenRoomOverheadsLight2 = 0;
                this.updateRequest.zigbee.switches.hall2OverheadsLight = 0;
                this.updateRequest.zigbee.switches.sashaOverheadsLight = 0;
                this.updateRequest.zigbee.switches.sashaTambourOverheadsLight = 0;
                this.updateRequest.zigbee.switches.bathroom2OverheadsLight = 0;
                this.updateRequest.zigbee.switches.boilerRoomOverheadsLight = 0;
                this.updateRequest.zigbee.switches.saunaOverheadsLight = 0;
                this.updateRequest.zigbee.switches.saunaUnderLight = 0;
                this.updateRequest.zigbee.switches.bathroom1OverheadsLight = 0;
                this.updateRequest.zigbee.switches.denisCabinetOverheadsLight = 0;
                this.updateRequest.zigbee.switches.garageOverheadsLight = 0;
                this.updateRequest.zigbee.switches.garageAwningLight = 0;
                
                return this;
        }

        homeCloseShutters(floor)
        {
                this.changeHomeShutters(floor, 0);
                return this;
        }

        homeOpenShutters(floor)
        {
                this.changeHomeShutters(floor, 1);
                return this;
        }

        garageCloseShutters()
        {
                this.changeGarageShutters(0);
                return this;
        }

        garageOpenShutters()
        {
                this.changeGarageShutters(1);
                return this;
        }

        changeHomeShutters(floor, state)
        {
                if (floor == 1 || floor == 2)
                {
                        if (this.updateRequest.kinconyRelays === undefined)
                                this.updateRequest.kinconyRelays = new Object();
                        if (this.updateRequest.kinconyRelays.Shutters === undefined)
                                this.updateRequest.kinconyRelays.Shutters = new Object();
                        if (this.updateRequest.kinconyRelays.Shutters.House === undefined)
                                this.updateRequest.kinconyRelays.Shutters.House = new Object();

                        switch(floor)
                        {
                                case 1:
                                        if (this.updateRequest.kinconyRelays.Shutters.House.F1 === undefined)
                                        this.updateRequest.kinconyRelays.Shutters.House.F1 = new Object();

                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W1 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W2 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W3 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W4 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W5 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W6 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F1.W7 = state;

                                        break;

                                case 2:
                                        if (this.updateRequest.kinconyRelays.Shutters.House.F2 === undefined)
                                        this.updateRequest.kinconyRelays.Shutters.House.F2 = new Object();

                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W1 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W2 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W3 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W4 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W5 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W6 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W7 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W8 = state;
                                        this.updateRequest.kinconyRelays.Shutters.House.F2.W9 = state;

                                        break;
                        }
                }
                return this;
        }

        changeGarageShutters(state)
        {
                if (this.updateRequest.kinconyRelays === undefined)
                        this.updateRequest.kinconyRelays = new Object();
                if (this.updateRequest.kinconyRelays.Shutters === undefined)
                        this.updateRequest.kinconyRelays.Shutters = new Object();
                if (this.updateRequest.kinconyRelays.Shutters.Garage === undefined)
                        this.updateRequest.kinconyRelays.Shutters.Garage = new Object();

                this.updateRequest.kinconyRelays.Shutters.Garage.W1 = state;
                this.updateRequest.kinconyRelays.Shutters.Garage.W2 = state;
                this.updateRequest.kinconyRelays.Shutters.Garage.W3 = state;

                return this;
        }
};


if (typeof exports !== 'undefined')
{
        exports.GetHouseStatus = GetHouseStatus;
        exports.SetMode = SetMode;
        exports.HouseState = HouseState;
}