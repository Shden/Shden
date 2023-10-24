const DB = require('mariadb');
const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');
const HouseMode = require('./id').HouseMode;

let dbConnectionPool = DB.createPool(config.DBConnection);
let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Static names for heating appliances:
const HeatingAppliance = Object.freeze({
        SAUNA_FLOOR: "saunaFloor",
        HALL_FLOOR: "hallFloor"
});

async function GetConfiguration()
{
        let houseStatus = await houseAPI.getStatus();
        // not sure is this will be needed as a separate 'heating' configuration.
        // so far will return whole config.
        return houseStatus.config;
}

/**
 * Returns climate setpoint change object as required to set house into the mode given.
 * Currently includes floor temperature setpoint updates (sauna and hall).
 * @param {*} newMode mode house will be set into.
 * @returns house shadow update object to change house configuration as requested.
 */
async function GetModeChangeUpdate(newMode)
{
        let config = await GetConfiguration();

        const getSetPoint =  (mode, applianceName) => {

                switch(mode) {
                        case HouseMode.PRESENCE_MODE:
                                return config.heating[applianceName]?.settings?.presence ?? 22;

                        case HouseMode.SHORTTERM_STANDBY:
                                return config.heating[applianceName]?.settings?.shortTermStandby ?? 15;

                        case HouseMode.LONGTERM_STANDBY:
                                return config.heating[applianceName]?.settings?.longTermStandby ?? 5;

                        default:
                                throw(`Invalid mode requested: ${mode}.`);
                }
        }
        
        let houseShadowUpdateRequest = {
                config: {
                        heating: {
                                [HeatingAppliance.SAUNA_FLOOR]: {
                                        setPoint: getSetPoint(newMode, HeatingAppliance.SAUNA_FLOOR)
                                },
                                [HeatingAppliance.HALL_FLOOR]: {
                                        setPoint: getSetPoint(newMode, HeatingAppliance.HALL_FLOOR)
                                }
                        }
                }
        }

        return houseShadowUpdateRequest;
}

/**
 * Update specified appliance temperature settings various house modes.
 * 
 * @param {*} forApplianceName heating appliance name to update. Currently
 * only saunaFloor and hallFloor are supported.
 * @param {*} presenceSetPoint appliance set point for presence mode.
 * @param {*} shortTermStandbySetPoint appliance set point for short term standby mode.
 * @param {*} longTermStandbySetPoint appliance set point for long term standby mode.
 * @returns house shadow updated.
 */
async function UpdateHeatingSetting(forApplianceName, presenceSetPoint, shortTermStandbySetPoint, longTermStandbySetPoint)
{
        let configUpdateRequest = {
                config: {
                        heating: {
                                [forApplianceName]: {
                                        settings: {
                                                presence: Number(presenceSetPoint),
                                                shortTermStandby: Number(shortTermStandbySetPoint),
                                                longTermStandby: Number(longTermStandbySetPoint)
                                        }
                                }
                        }
                }
        };

        return await houseAPI.updateStatus(configUpdateRequest);
}

async function SetBathVentilationOn(duration)
{
        // just turns on -- temporary implementation
        let updateRequest = {
                oneWireStatus : {
                        switches : { 
                                saunaVentilation : 1
                        }
                }
        };

        return await houseAPI.updateStatus(updateRequest);
}

exports.GetConfiguration = GetConfiguration;
exports.SetBathVentilationOn = SetBathVentilationOn;
exports.GetModeChangeUpdate = GetModeChangeUpdate;
exports.UpdateHeatingSetting = UpdateHeatingSetting;
exports.HeatingAppliance = HeatingAppliance;