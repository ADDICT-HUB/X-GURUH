console.log('🤖 Botguru - Patched for Private Repo');
console.log('=====================================\n');

// First, patch the require function to redirect to private repo
const Module = require('module');
const path = require('path');
const fs = require('fs');

const originalRequire = Module.prototype.require;

// Redirect these modules to private repo
const privateModules = {
  './lib/groupevents': '../botguru-private/lib/groupevents',
  './lib': '../botguru-private/lib',
  './data': '../botguru-private/data',
  './plugins': '../botguru-private/plugins',
  './autos': '../botguru-private/autos',
  './sessions': '../botguru-private/sessions',
  './ADDICT-HUB X GUI': '../botguru-private/ADDICT-HUB X GUI'
};

Module.prototype.require = function(id) {
  // Check if this is a module we should redirect
  if (privateModules[id]) {
    const privatePath = path.resolve(__dirname, privateModules[id]);
    
    // Check if private file exists
    const extensions = ['', '.js', '.json', '/index.js'];
    for (const ext of extensions) {
      const fullPath = privatePath + ext;
      if (fs.existsSync(fullPath)) {
        console.log(`🔗 Redirected: ${id} → ${privateModules[id]}`);
        return originalRequire.call(this, privateModules[id]);
      }
    }
  }
  
  // Also handle relative requires that might be looking for lib/*
  if (id.startsWith('./lib/')) {
    const privateLibPath = '../botguru-private/' + id.substring(2);
    const fullPath = path.resolve(__dirname, privateLibPath);
    
    if (fs.existsSync(fullPath) || fs.existsSync(fullPath + '.js')) {
      console.log(`🔗 Redirected lib: ${id} → ${privateLibPath}`);
      return originalRequire.call(this, privateLibPath);
    }
  }
  
  // Default behavior
  return originalRequire.call(this, id);
};

console.log('✅ Module redirector activated');
console.log('📁 Private repo:', path.resolve(__dirname, '../botguru-private'));

// Now load the original index.js
console.log('\n🚀 Loading main bot code...\n');
require('./index-original.js');
