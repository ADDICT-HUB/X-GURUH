// Minimal configdb for Heroku deployment
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');
const defaultConfig = {
    MODE: "public",
    PREFIX: ".",
    BOTNAME: "Botguru",
    OWNER: "254116284050",
    SESSION_ID: "Botguru-session"
};

function getConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return { ...defaultConfig, ...JSON.parse(data) };
        }
        return defaultConfig;
    } catch (error) {
        console.error('Config error:', error.message);
        return defaultConfig;
    }
}

module.exports = { getConfig };
