console.log('🧪 Testing with fixed settings...\n');

// Test 1: Settings
try {
  const config = require('../botguru-private/settings');
  console.log('✅ Settings loaded successfully!');
  console.log('   Bot Name:', config.BOT_NAME);
  console.log('   Prefix:', config.PREFIX);
  console.log('   Baileys:', config.BAILEYS);
  console.log('   Welcome enabled:', config.WELCOME);
  
  // Check all keys
  console.log('\n📋 All settings keys:');
  Object.keys(config).forEach(key => {
    console.log(`   ${key}: ${config[key]}`);
  });
} catch (e) {
  console.log('❌ Settings error:', e.message);
  console.log('   Stack:', e.stack);
}

// Test 2: GroupEvents
console.log('\n---');
try {
  const groupevents = require('../botguru-private/lib/groupevents');
  console.log('✅ GroupEvents loaded successfully!');
  console.log('   Type:', typeof groupevents);
  
  // Test if it's a function
  if (typeof groupevents === 'function') {
    console.log('   ✅ It\'s a callable function');
  }
} catch (e) {
  console.log('❌ GroupEvents error:', e.message);
}

// Test 3: Full integration test
console.log('\n---');
console.log('🔧 Testing full integration...');
try {
  const config = require('../botguru-private/settings');
  const GroupEvents = require('../botguru-private/lib/groupevents');
  const baileys = require('@whiskeysockets/baileys');
  
  console.log('✅ All modules loaded successfully!');
  console.log('   ✓ Settings: OK');
  console.log('   ✓ GroupEvents: OK');
  console.log('   ✓ Baileys: OK');
  
  console.log('\n🎯 Ready to run the main bot!');
  console.log('   Command: node index.js');
} catch (e) {
  console.log('❌ Integration error:', e.message);
}
