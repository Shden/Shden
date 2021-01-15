// ESP controllers gate. Simply replicates AWS reported state, nothing  more.
const fs = require('fs');
const path = require('path');
const lockFile = require('lockfile');

const configFile = path.join(__dirname, '../../shc/config/esp-status.json');
const lockName = 'esp-status.lock';

// Retrieve REST object representing current ESP state
async function getState()
{
        return new Promise((resolved, rejected) => {
                fs.readFile(configFile, (err, data) => {
                        if (err)
                                // no config is not en error
                                resolved({});
                        resolved(JSON.parse(data));
                });
        });
}

// Update cached state
async function updateCachedState(updatedState)
{
        let currentState = await getState();
        let combinedState = { ...currentState, ...updatedState }; // NB! shallow merge

        return new Promise((resolved, rejected) => {
                lockFile.lock(lockName, function (err) {
                        if (err) rejected(err);
                        fs.writeFile(configFile, JSON.stringify(combinedState), (err) => {
                                lockFile.unlock(lockName);
                                if (err) rejected(err);
                                resolved(combinedState);
                        });
                });


        });
}

exports.getState = getState;
exports.updateCachedState = updateCachedState;