console.log('🤖 Botguru WhatsApp Bot - Fixed Version');
console.log('=======================================\n');

// Load environment variables
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
} catch (e) {
  console.log('⚠️  dotenv not installed, using defaults');
}

const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  Browsers,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  BOT_NAME: process.env.BOT_NAME || 'Botguru',
  PREFIX: process.env.PREFIX || '!',
  OWNER: process.env.OWNER || '',
  AUTH_DIR: './auth_info',
  SESSION_TYPE: 'local' // Force local session, not MEGA
};

console.log('⚙️ Configuration:');
console.log(`  Bot: ${config.BOT_NAME}`);
console.log(`  Prefix: ${config.PREFIX}`);
console.log(`  Auth: ${config.AUTH_DIR}`);
console.log(`  Session: ${config.SESSION_TYPE}\n`);

let reconnectCount = 0;
const maxReconnects = 10;

async function startConnection() {
  reconnectCount++;
  console.log(`🔗 Connection attempt ${reconnectCount}/${maxReconnects}`);
  
  if (reconnectCount > maxReconnects) {
    console.log('❌ Max reconnection attempts reached. Restart bot to try again.');
    return;
  }
  
  try {
    // Create auth directory if it doesn't exist
    if (!fs.existsSync(config.AUTH_DIR)) {
      fs.mkdirSync(config.AUTH_DIR, { recursive: true });
      console.log('📁 Created auth directory');
    }
    
    // Use local file-based authentication
    const { state, saveCreds } = await useMultiFileAuthState(config.AUTH_DIR);
    
    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: true,
      logger: { level: 'warn' },
      connectTimeoutMs: 60000,
    });
    
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('📱 QR CODE DETECTED!');
        console.log('Scan with WhatsApp:');
        console.log('1. Open WhatsApp → Settings → Linked Devices');
        console.log('2. Tap "Link a Device"');
        console.log('3. Scan the QR code above');
        console.log('═══════════════════════════════════════════════════\n');
        reconnectCount = 0; // Reset on QR display
      }
      
      if (connection === 'open') {
        console.log('🎉 ✅ SUCCESSFULLY CONNECTED TO WHATSAPP!');
        console.log(`🤖 ${config.BOT_NAME} is now ONLINE`);
        console.log('\n💡 Try sending "ping" to test the bot');
        console.log('💡 Or "menu" to see available commands');
        reconnectCount = 0;
      }
      
      if (connection === 'close') {
        const error = lastDisconnect?.error;
        const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log(`❌ Connection closed: ${error?.message || 'Unknown error'}`);
        
        if (shouldReconnect) {
          const delayTime = Math.min(5000 * reconnectCount, 30000);
          console.log(`🔄 Reconnecting in ${delayTime/1000} seconds...`);
          setTimeout(startConnection, delayTime);
        } else {
          console.log('⚠️  Logged out. Need to scan QR code again.');
          // Remove auth files to force fresh login
          fs.rmSync(config.AUTH_DIR, { recursive: true, force: true });
          setTimeout(startConnection, 3000);
        }
      }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Handle incoming messages
    sock.ev.on('messages.upsert', ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || '';
      const sender = msg.key.remoteJid;
      
      // Basic commands
      if (text.toLowerCase() === 'ping') {
        sock.sendMessage(sender, { text: '🏓 Pong! Botguru is working!' });
        console.log(`📨 Responded to ping from ${sender}`);
      }
      
      if (text.toLowerCase() === 'menu') {
        const menu = `🤖 *${config.BOT_NAME} Menu*\n\n` +
                    `Available commands:\n` +
                    `• ping - Test if bot is alive\n` +
                    `• menu - Show this menu\n` +
                    `• time - Current time\n` +
                    `• owner - Bot owner info\n\n` +
                    `Prefix: ${config.PREFIX}\n` +
                    `_Running on Termux_ 📱`;
        sock.sendMessage(sender, { text: menu });
        console.log(`📨 Sent menu to ${sender}`);
      }
      
      if (text.toLowerCase() === 'time') {
        const now = new Date();
        const timeStr = now.toLocaleString();
        sock.sendMessage(sender, { text: `⏰ Current time: ${timeStr}` });
      }
      
      if (text.toLowerCase() === 'owner') {
        const owner = config.OWNER || 'Not configured yet';
        sock.sendMessage(sender, { text: `👑 Bot Owner: ${owner}` });
      }
      
      // Echo test
      if (text.toLowerCase().startsWith('echo ')) {
        const echoText = text.substring(5);
        sock.sendMessage(sender, { text: `📢 Echo: ${echoText}` });
      }
    });
    
    console.log('⏳ Waiting for QR code or connection...');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    const delayTime = Math.min(5000 * reconnectCount, 30000);
    console.log(`🔄 Retrying in ${delayTime/1000} seconds...`);
    setTimeout(startConnection, delayTime);
  }
}

// Install dotenv if needed
try {
  require('dotenv');
} catch (e) {
  console.log('📦 Installing dotenv...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install dotenv --no-optional', { stdio: 'inherit' });
    console.log('✅ dotenv installed');
  } catch (installError) {
    console.log('⚠️  Could not install dotenv, continuing without it');
  }
}

// Start the connection
startConnection();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Botguru...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔚 Termination signal received...');
  process.exit(0);
});

console.log('🚀 Botguru startup complete');
console.log('📱 Ready to connect to WhatsApp\n');
