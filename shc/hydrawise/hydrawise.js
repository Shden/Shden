const Hydrawise = require('hydrawise-api').Hydrawise;
const config = require('../config/hydrawise.json');

const myHydrawise = new Hydrawise({ type: 'CLOUD', key: config.HydrowiseAPIKey });

myHydrawise.getControllers()
        .then((controllers) => {

                controllers.forEach(controller => {

                        const controllerName = controller.name;
                        const controllerId = controller.id;

                        controller.getZones().then((zones) => {

                                zones.forEach(zone => {
                                        const zoneID = zone.zone;
                                        const relayID = zone.relayID;
                                        const nextRunAt = new Date(zone.nextRunAt);
                                        const nextRunDuration = zone.nextRunDuration;

                                        const diff = (nextRunAt - new Date())/(1000 * 60); // diff between now and run time in minutes 
                                        console.log(diff, controllerName, zoneID, relayID, nextRunAt, nextRunDuration);
                                });

                        });
                        
                });

        })
        .catch(error => console.log(error));