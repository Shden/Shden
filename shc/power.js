// Publishes power status updates.
const mp = require('./mqtt-publish');
const { exec } = require('child_process');
const { resolve } = require('path');
const { rejects } = require('assert');

if (require.main === module)
{
        const mercury236CmdLine = '/Users/den/Shden/mercury236/mercury236 RS485 --testRun --json';

        getPowerMeterData(mercury236CmdLine)
                .then(output => {
                        var powerDataPoint = JSON.parse(output);
                        mp.publishPowerDataPoint(powerDataPoint);
                })
}

function getPowerMeterData(mercuryCommandLine)
{
        return new Promise((resolved, rejected) => {

                const powerMeterUtil = exec(mercuryCommandLine, (error, stdout, stderr) => {
                        if (error) {
                                rejected(error);
                        }
                        resolved(stdout);
                });
        })
}

// -- Exports for testing
if (typeof exports !== 'undefined')
{
        // methods
        exports.getPowerMeterData = getPowerMeterData;
}