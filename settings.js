const fs = require('fs');
const path = require('path');
const { getConfig } = require('./core_public/lib/configdb');
const settings = require('./settingss');

if (fs.existsSync(path.resolve('config.env'))) {
  require('dotenv').config({ path: path.resolve('config.env') });
}

// Helper to convert "true"/"false" strings to actual boolean
function parseBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

// Load configuration
const config = getConfig();

// Export configuration
module.exports = {
  // MODE: public/private/self/grouponly
  MODE: config.MODE || "public",
  
  // Bot prefix
  PREFIX: config.PREFIX || ".",
  
  // Bot name
  BOTNAME: config.BOTNAME || "BOT GURU",
  
  // Owner number (with country code)
  OWNER: config.OWNER || "254116284050",
  
  // Session ID (for multi-device)
  SESSION_ID: config.SESSION_ID || "Botguru-session",
  
  // Other settings from settingss.js
  ...settings
};
