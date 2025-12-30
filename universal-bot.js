console.log('🤖 Botguru - Universal WhatsApp Bot');
console.log('===================================\n');

// Detect platform
const platform = {
  isHeroku: !!process.env.DYNO || process.env.NODE_ENV === 'production',
  isTermux: __dirname.includes('com.termux'),
  isPanel: !!process.env.PANEL_TYPE || process.env.PTERODACTYL_SERVER_UUID,
  isVPS: process.platform === 'linux' && !__dirname.includes('com.termux')
};

console.log('📡 Platform Detection:');
console.log(`   Heroku: ${platform.isHeroku ? '✅' : '❌'}`);
console.log(`   Termux: ${platform.isTermux ? '✅' : '❌'}`);
console.log(`   Panel: ${platform.isPanel ? '✅' : '❌'}`);
console.log(`   VPS: ${platform.isVPS ? '✅' : '❌'}`);

// Configuration for different platforms
const config = {
  BOT_NAME: process.env.BOT_NAME || 'Botguru-Universal',
  PREFIX: process.env.PREFIX || '!',
  PORT: process.env.PORT || 3000,
  
  // Platform-specific settings
  USE_PRIVATE_REPO: !platform.isHeroku, // Heroku can't access private repo
  SHOW_QR_IN_TERMINAL: !platform.isPanel, // Panels might not show terminal
  SESSION_PATH: platform.isHeroku ? './heroku_session' : './whatsapp_session'
};

// Module loader for different environments
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  // Handle platform-specific module loading
  if (id.includes('./lib/') || id.includes('./data/') || id.includes('./plugins/')) {
    if (platform.isHeroku || !config.USE_PRIVATE_REPO) {
      // On Heroku or without private repo access
      console.log(`🔧 ${platform.isHeroku ? 'Heroku' : 'Panel'}: Mocking ${id}`);
      
      if (id.includes('groupevents')) {
        return (malvin, update) => {
          console.log('📱 Group event (mock):', update?.action);
          return Promise.resolve();
        };
      }
      
      if (id.includes('sharp') || id.includes('wa-sticker-formatter')) {
        console.log('🖼️  Image modules mocked');
        return {
          create: () => Promise.resolve({}),
          Sticker: class Sticker { build() { return Promise.resolve(Buffer.from('')); } }
        };
      }
      
      return {};
    } else {
      // Local/Termux/VPS - try to load from private repo
      try {
        return originalRequire.call(this, id.replace('./', '../botguru-private/'));
      } catch (e) {
        console.log(`⚠️  Could not load ${id}, using fallback`);
        return {};
      }
    }
  }
  
  return originalRequire.call(this, id);
};

// WhatsApp Bot Core
const { makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const http = require('http');

// Web server for platforms that need it (Heroku, some panels)
if (platform.isHeroku || platform.isPanel) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      bot: config.BOT_NAME,
      platform: platform.isHeroku ? 'Heroku' : platform.isPanel ? 'Panel' : 'Other',
      whatsapp: 'connecting',
      uptime: process.uptime()
    }));
  });
  
  server.listen(config.PORT, () => {
    console.log(`✅ HTTP server on port ${config.PORT} (${platform.isHeroku ? 'Heroku requirement' : 'Panel access'})`);
  });
}

async function startWhatsAppBot() {
  console.log('\n🔗 Starting WhatsApp connection...');
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_PATH);
    
    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: config.SHOW_QR_IN_TERMINAL,
      logger: { level: 'warn' },
    });
    
    let isConnected = false;
    
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      
      if (qr) {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('📱 WHATSAPP QR CODE DETECTED');
        console.log('═══════════════════════════════════════════════════');
        
        if (platform.isHeroku) {
          console.log('Heroku: Copy this QR data to qrcodemonkey.com');
          console.log(qr.substring(0, 100) + '...');
        } else if (platform.isPanel) {
          console.log('Panel: Check panel logs/terminal for QR code');
          console.log('QR length:', qr.length, 'characters');
        } else {
          console.log('Scan QR code with WhatsApp');
        }
        
        console.log('═══════════════════════════════════════════════════\n');
      }
      
      if (connection === 'open' && !isConnected) {
        isConnected = true;
        console.log('🎉 ✅ WHATSAPP CONNECTED!');
        console.log(`🤖 ${config.BOT_NAME} is ONLINE`);
        console.log(`📡 Platform: ${platform.isHeroku ? 'Heroku' : platform.isPanel ? 'Panel' : platform.isTermux ? 'Termux' : 'VPS'}`);
        
        // Platform-specific success message
        if (platform.isHeroku) {
          console.log('🌐 Your bot is running in the cloud!');
          console.log('🔗 Check status at: https://your-app.herokuapp.com');
        }
        
        if (platform.isPanel) {
          console.log('🖥️  Your bot is running on a panel!');
          console.log('📊 Check panel dashboard for status');
        }
      }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Universal commands
    sock.ev.on('messages.upsert', ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const text = msg.message.conversation || '';
      const sender = msg.key.remoteJid;
      
      if (text.toLowerCase() === 'ping') {
        const platformName = platform.isHeroku ? 'Heroku' : 
                           platform.isPanel ? 'Panel' : 
                           platform.isTermux ? 'Termux' : 'VPS';
        
        sock.sendMessage(sender, { 
          text: `🏓 Pong! From ${platformName}! 🚀\n` +
                `🤖 ${config.BOT_NAME}\n` +
                `📡 ${new Date().toLocaleString()}`
        });
      }
      
      if (text.toLowerCase() === 'platform') {
        let platformInfo = '';
        if (platform.isHeroku) platformInfo = '🌐 *Heroku Cloud*';
        if (platform.isPanel) platformInfo = '🖥️  *Control Panel*';
        if (platform.isTermux) platformInfo = '📱 *Termux (Android)*';
        if (platform.isVPS) platformInfo = '💻 *VPS Server*';
        
        sock.sendMessage(sender, {
          text: `${platformInfo}\n\n` +
                `• Platform: ${platform.isHeroku ? 'Heroku' : platform.isPanel ? 'Panel' : platform.isTermux ? 'Termux' : 'VPS'}\n` +
                `• Uptime: ${Math.floor(process.uptime())} seconds\n` +
                `• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
                `• Node.js: ${process.version}\n\n` +
                `✅ Universal Bot - Runs anywhere!`
        });
      }
      
      if (text.toLowerCase() === 'menu') {
        sock.sendMessage(sender, {
          text: `🤖 *${config.BOT_NAME} Menu*\n\n` +
                `Commands:\n` +
                `• ping - Test connection\n` +
                `• platform - Show platform info\n` +
                `• menu - This menu\n` +
                `• status - Bot status\n\n` +
                `📍 Running on: ${platform.isHeroku ? 'Heroku ☁️' : platform.isPanel ? 'Panel 🖥️' : platform.isTermux ? 'Termux 📱' : 'VPS 💻'}`
        });
      }
    });
    
    console.log('⏳ Waiting for WhatsApp connection...');
    
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    console.log('🔄 Retrying in 30 seconds...');
    setTimeout(startWhatsAppBot, 30000);
  }
}

// Start bot
console.log('\n🚀 Starting Universal WhatsApp Bot...');
startWhatsAppBot();

// Keep process alive
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log(`📊 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | ` +
              `Uptime: ${Math.floor(process.uptime())}s`);
}, 60000);
