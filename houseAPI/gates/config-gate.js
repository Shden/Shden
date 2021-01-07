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

/**
 * Performs a deep merge of `source` into `target`.
 * Mutates `target` only but not its objects and arrays.
 *
 * @author inspired by [jhildenbiddle](https://stackoverflow.com/a/48218209).
 */
function mergeDeep(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object';

        if (!isObject(target) || !isObject(source)) {
                return source;
        }

        Object.keys(source).forEach(key => {
                const targetValue = target[key];
                const sourceValue = source[key];

                if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                        target[key] = targetValue.concat(sourceValue);
                } else if (isObject(targetValue) && isObject(sourceValue)) {
                        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
                } else {
                        target[key] = sourceValue;
                }
        });

        return target;
}

// Updates house configuration based on the requested new state
async function updateConfig(newConfig)
{
        let currentConfig = await getConfig();
        let combinedConfig = mergeDeep(currentConfig, newConfig);

        return new Promise((resolved, rejected) => {
                fs.writeFile(configFile, JSON.stringify(combinedConfig), (err) => {
                        if (err) rejected(err);
                        resolved(combinedConfig);
                });
        });
}

exports.getConfig = getConfig;
exports.updateConfig = updateConfig;