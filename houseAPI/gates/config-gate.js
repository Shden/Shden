// House configuration gate.
const { rejects } = require('assert');
var fs = require('fs');

const configFile = '/Users/den/Shden/shc/config/house-config.json';

// Creates REST object representing current house configuration
async function getConfig()
{
        return new Promise((resolved, rejected) => {
                fs.readFile(configFile, (err, data) => {
                        if (err) rejected (err);
                        resolved(JSON.parse(data));
                });
        });
}

// Updates house configuration based on the requested new state
async function updateConfig(newConfig)
{
        return new Promise((resolved, rejected) => {
                fs.writeFile(configFile, JSON.stringify(newConfig), (err) => {
                        if (err) rejected(err);
                        resolved(newConfig);
                });
        });
}

exports.getConfig = getConfig;
exports.updateConfig = updateConfig;