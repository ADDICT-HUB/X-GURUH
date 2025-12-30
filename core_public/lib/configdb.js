const fs = require('fs');
const path = require('path');

class ConfigDB {
    constructor() {
        this.configPath = path.join(__dirname, '../../config.json');
        this.defaultConfig = {
            MODE: "public",
            PREFIX: ".",
            BOTNAME: "Botguru",
            OWNER: "254116284050",
            SESSION_ID: "Botguru-session"
        };
        this.loadConfig();
    }
    
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                this.config = { ...this.defaultConfig, ...JSON.parse(configData) };
            } else {
                this.config = this.defaultConfig;
                this.saveConfig();
            }
        } catch (error) {
            console.error('Error loading config:', error);
            this.config = this.defaultConfig;
        }
        return this.config;
    }
    
    saveConfig(newConfig = null) {
        try {
            if (newConfig) {
                this.config = { ...this.config, ...newConfig };
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }
    
    get(key) { return this.config[key]; }
    set(key, value) { this.config[key] = value; return this.saveConfig(); }
    getAll() { return this.config; }
}

module.exports = new ConfigDB();
