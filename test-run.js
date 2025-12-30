console.log('🧪 Testing Bot Setup...\n');

// Test baileys is installed
try {
  const baileys = require('@whiskeysockets/baileys');
  console.log('✅ Baileys loaded successfully');
  console.log('   Version:', baileys.version || 'unknown');
} catch (e) {
  console.log('❌ Baileys error:', e.message);
}

// Test private repo access
try {
  const config = require('../botguru-private/settings');
  console.log('✅ Settings loaded');
  console.log('   BAILEYS path:', config.BAILEYS || 'not set');
} catch (e) {
  console.log('❌ Settings error:', e.message);
}

// Test groupevents
try {
  const groupevents = require('../botguru-private/lib/groupevents');
  console.log('✅ GroupEvents loaded');
  console.log('   Type:', typeof groupevents);
} catch (e) {
  console.log('❌ GroupEvents error:', e.message);
}

console.log('\n🎯 Ready to run main bot...');
console.log('   Run: node index.js');
