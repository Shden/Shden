const https = require('https');
const HTTPStatus = require('http-status-codes').StatusCodes;
const config = require('../config/baxi-connect-config.json');

// integration module for zont API see https://lk.zont-online.ru/widget-api/v2 documentation.

/**
 * 
 * Get baxi connect device status: heating_circuits, boiler_circuits, heating_modes, sensors, ot_sensors.
 * 
 */ 
function getBaxiStatus()
{
        return new Promise((resolved, rejected) => {
                let request = https.request({
                        hostname: config.host,
                        path: config.get_devices_path,
                        method: 'POST',
                        headers: {
                                'accept': 'application/json',
                                'X-ZONT-Client': config['X-ZONT-Client'],
                                'X-ZONT-Token': config['X-ZONT-Token'],
                                'Content-Type': 'application/json'
                        }
                }, responce => {
			if (responce.statusCode != HTTPStatus.OK)
				rejected(responce.statusCode);

                        var data = '';
                        responce.on('data', d => {
                                data += d;
                        });

                        responce.on('end', () => {
                                try
                                {
                                        let devicesPayload = JSON.parse(data);

                                        // baxi connect device, container for: heating_circuits, boiler_circuits, heating_modes, sensors, ot_sensors
                                        let baxiConnect = devicesPayload.devices.find(device => device.id === 335339);

                                        let heatingCircut = baxiConnect.heating_circuits.find(c => c.id === 20496);
                                        let hotWaterCircut = baxiConnect.heating_circuits.find(c => c.id === 20603);

                                        let nanaoBoiler = baxiConnect.boiler_circuits.find(b => b.id === 20494);
                                        let backupBoiler = baxiConnect.boiler_circuits.find(b => b.id === 20604);

                                        // baxi connect sensors
                                        let voltageSensor = baxiConnect.sensors.find(s => s.id === 0);          // Напряжение питания
                                        let fluidTemperature = baxiConnect.sensors.find(s => s.id === 20560);   // Датчик теплоносителя
                                        let airTemperature = baxiConnect.sensors.find(s => s.id === 20561);     // Датчик воздуха
                                        let wirelessTemperature = baxiConnect.sensors.find(s => s.id === 4098); // Радиодатчик упр.

                                        // boiler open therm sensors 
                                        let THTemperature = baxiConnect.ot_sensors.find(s => s.id === '20600:bt');              // Адаптер цифровой шины t° ТН
                                        let modulation = baxiConnect.ot_sensors.find(s => s.id === '20600:rml');                // Адаптер цифровой шины Модуляция
                                        let revFluidTemperature = baxiConnect.ot_sensors.find(s => s.id === '20600:rwt');       // Адаптер цифровой шины t° обратного потока
                                        let THPressure = baxiConnect.ot_sensors.find(s => s.id === '20600:wp');                 // Адаптер цифровой шины Давление ТН
                                        let hotWaterTemperature = baxiConnect.ot_sensors.find(s => s.id === '20600:dt');        // Адаптер цифровой шины t° ГВС
                                        let outsideTemperature = baxiConnect.ot_sensors.find(s => s.id === '20600:ot');         // Адаптер цифровой шины t° снаружи
                                        let hotWaterConsumption = baxiConnect.ot_sensors.find(s => s.id === '20600:fr');        // Адаптер цифровой шины Скорость потока ГВС

                                        const pickCircut = (({status, active, actual_temp, is_off, target_temp, current_mode}) => ({status, active, actual_temp, is_off, target_temp, current_mode}));
                                        const pickBoiler = (({name, active, status, target_temp, water_temp, rwt_temp, modulation_level, pressure, outside}) => ({name, active, status, target_temp, water_temp, rwt_temp, modulation_level, pressure, outside}));
                                        
                                        resolved({
                                                baxiConnect: {
                                                        online: baxiConnect.online
                                                },
                                                heatingCircut: pickCircut(heatingCircut),
                                                hotWaterCircut: pickCircut(hotWaterCircut),
                                                nanaoBoiler: pickBoiler(nanaoBoiler),
                                                backupBoiler: pickBoiler(backupBoiler),
                                                sensors: {
                                                        voltage: voltageSensor.value,
                                                        fluidTemperature: fluidTemperature.value,
                                                        boilerRoomTemperature: airTemperature.value,
                                                        controlTemperature: wirelessTemperature.value
                                                },
                                                ot_sensors: {
                                                        fluidOut: THTemperature.value,
                                                        modulation: modulation.value,
                                                        fluidIn: revFluidTemperature.value,
                                                        pressure: THPressure.value,
                                                        hotWater: hotWaterTemperature.value,
                                                        outside: outsideTemperature.value,
                                                        hotWaterConsumption: hotWaterConsumption.value
                                                }
                                        });
                                }
                                catch(e)
                                {
                                        console.error(e);
                                        rejected(e);
                                }
                        });

			responce.on('error', err => {
				console.error(err);
				rejected(err);
			});
                });

                request.end();
        });
}

/**
 * 
 * Update baxi mode or target temperature setpoint.
 * 
 * @param {*} baxiUpdate - request object shall have heatingCircut object 
 *      with either target_temp OR current_mode as follows:
 *      {
 *        heatingCircut: {
 *          target_temp: 19,
 *          current_mode: 20502
 *        }
 *      }
 */
function updateBaxiStatus(baxiUpdate)
{
        return new Promise((resolved, rejected) => {
                // console.log(baxiUpdate);
                if (
                        baxiUpdate === undefined || 
                        baxiUpdate.heatingCircut === undefined || 
                        (baxiUpdate.heatingCircut.target_temp === undefined && target_temp.current_mode === undefined)
                )
                        rejected(new Error('Invalid baxiUpdate parameter'));
                
                else if (baxiUpdate.heatingCircut.target_temp !== undefined) { 
                        if (isNaN(baxiUpdate.heatingCircut.target_temp))
                                rejected(new Error(`Invalid target_temp value: [${baxiUpdate.heatingCircut.target_temp}].`));

                        // valid target_temp handling:
                        let request = https.request({
                                hostname: config.host,
                                path: config.set_target_temp_path,
                                method: 'POST',
                                headers: {
                                        'accept': 'application/json',
                                        'X-ZONT-Client': config['X-ZONT-Client'],
                                        'X-ZONT-Token': config['X-ZONT-Token'],
                                        'Content-Type': 'application/json'
                                }
                        }, responce => {
                                if (responce.statusCode != HTTPStatus.OK)
                                        rejected(responce.statusCode);
        
                                var data = '';
                                responce.on('data', d => {
                                        data += d;
                                });
        
                                responce.on('end', () => {
                                        try
                                        {
                                                let responseBody = JSON.parse(data);

                                                if (responseBody.ok && responseBody.new_target_temp == baxiUpdate.heatingCircut.target_temp)
                                                        resolved(responseBody.new_target_temp)
                                                else
                                                        rejected();
        
                                        }
                                        catch(e)
                                        {
                                                console.error(e);
                                                rejected(e);
                                        }
                                });
        
                                responce.on('error', err => {
                                        console.error(err);
                                        rejected(err);
                                });
                        });
        
                        request.write(JSON.stringify(
                                {
                                        device_id: config.device_id,
                                        circuit_id: config.circuit_id,
                                        target_temp: baxiUpdate.heatingCircut.target_temp
                                }));
                        request.end();                        
                }
                
                else if (baxiUpdate.heatingCircut.current_mode !== undefined) {
                        if (isNaN(baxiUpdate.heatingCircut.current_mode))
                                rejected(new Error(`Invalid current_mode value: [${baxiUpdate.heatingCircut.current_mode}].`));

                        // valid current_mode handling:
                }
        });
}

if (typeof exports !== 'undefined')
{
        exports.getBaxiStatus = getBaxiStatus;
        exports.updateBaxiStatus = updateBaxiStatus;
}