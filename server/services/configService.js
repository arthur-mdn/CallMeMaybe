// services/configService.js
import Config from '../models/Config.js';

export async function loadConfig() {
    const entries = await Config.find({});
    const configObject = {};

    for (const entry of entries) {
        configObject[entry.key] = entry.value;
    }

    return configObject;
}

export async function getConfigObject() {
    const configs = await Config.find({});
    return configs.reduce((acc, conf) => {
        acc[conf.key] = conf.value;
        return acc;
    }, {});
}

export async function getConfigValue(key, defaultValue = null) {
    const entry = await Config.findOne({ key });
    return entry ? entry.value : defaultValue;
}

export async function setConfigValue(key, value) {
    return await Config.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
    );
}