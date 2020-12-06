// House configuration gate.
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '../../shc/config/house-config.json');

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
        let currentConfig = await getConfig();
        let combinedConfig = { ...currentConfig, ...newConfig };

        return new Promise((resolved, rejected) => {
                fs.writeFile(configFile, JSON.stringify(combinedConfig), (err) => {
                        if (err) rejected(err);
                        resolved(combinedConfig);
                });
        });
}

exports.getConfig = getConfig;
exports.updateConfig = updateConfig;