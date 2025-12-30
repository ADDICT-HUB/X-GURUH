// Bypass sharp and other problematic modules
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  // Bypass sharp completely
  if (id.includes('sharp') || id.includes('wa-sticker-formatter')) {
    console.log(`📦 Bypassing: ${id}`);
    return {
      // Basic image functions
      create: async () => ({ data: Buffer.from(''), info: {} }),
      resize: async () => ({ data: Buffer.from(''), info: {} }),
      toBuffer: async () => Buffer.from(''),
      metadata: async () => ({ width: 512, height: 512 }),
      // Sticker formatter
      Sticker: class Sticker {
        constructor() { console.log('Sticker created (dummy)'); }
        build() { return Promise.resolve(Buffer.from('')); }
      }
    };
  }
  
  // Bypass other problematic modules
  if (id.includes('canvas') || id.includes('ffmpeg')) {
    console.log(`🎨 Bypassing: ${id}`);
    return {};
  }
  
  try {
    return originalRequire.call(this, id);
  } catch(e) {
    // If it's a baileys issue, try to load it properly
    if (id === '@whiskeysockets/baileys') {
      console.log('🔧 Loading baileys directly...');
      return require('./node_modules/@whiskeysockets/baileys');
    }
    
    console.log(`⚠️  Could not load ${id}, using empty object`);
    return {};
  }
};

console.log('🚀 Starting Botguru with module bypass...');
console.log('📦 This bypasses image/sticker modules that need native compilation\n');

// Now load your index.js
try {
  require('./index.js');
} catch(e) {
  console.error('❌ Bot crashed:', e.message);
  console.log('\n🔄 Trying alternative startup...');
  
  // Try simple startup
  const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
  const config = require('../botguru-private/settings');
  
  console.log(`🤖 ${config.BOT_NAME} - Simple Mode`);
  console.log('🔗 Connecting to WhatsApp...');
  
  async function startSimple() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: Browsers.ubuntu('Chrome'),
    });
    
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      if (qr) console.log('📱 Scan QR code above');
      if (connection === 'open') console.log('✅ Connected!');
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Simple ping command
    sock.ev.on('messages.upsert', ({ messages }) => {
      const msg = messages[0];
      const text = msg.message?.conversation;
      if (text === '!ping') {
        sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
      }
    });
    
    console.log('🤖 Bot running in simple mode (no stickers/images)');
  }
  
  startSimple().catch(console.error);
}
