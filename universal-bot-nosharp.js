console.log('🤖 Botguru - No Sharp Version');
console.log('==============================\n');

// Patch require to bypass sharp
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id.includes('sharp') || id.includes('wa-sticker-formatter')) {
    console.log(`🔧 Bypassing: ${id}`);
    return {
      create: () => Promise.resolve({}),
      Sticker: class Sticker { build() { return Promise.resolve(Buffer.from('')); } }
    };
  }
  return originalRequire.call(this, id);
};

// Load the rest of universal bot
require('./universal-bot.js');
