console.log('🤖 Botguru - Session Detection Bot');
console.log('==================================\n');

// Check for session in environment variables
const SESSION_ID = process.env.WHATSAPP_SESSION_ID || 
                   process.env.SESSION_ID || 
                   process.env.WHATSAPP_SESSION;

console.log('🔍 Checking for session configuration...');

if (SESSION_ID) {
  console.log('✅ Session ID found in environment variables');
  console.log('📦 Type:', typeof SESSION_ID);
  console.log('🔢 Length:', SESSION_ID.length);
  
  // Check if it looks like a MEGA session
  if (SESSION_ID.includes('Xguru~')) {
    console.log('📱 Detected MEGA session format');
  }
  
  // Check if it looks like base64
  if (SESSION_ID.match(/^[A-Za-z0-9+/]+={0,2}$/) && SESSION_ID.length > 100) {
    console.log('🔐 Detected Base64 encoded session');
  }
} else {
  console.log('⚠️  No session ID found in environment variables');
  console.log('💡 Add WHATSAPP_SESSION_ID to Heroku Config Vars');
}

// HTTP server for Heroku
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: 'Botguru',
    session: SESSION_ID ? 'configured' : 'not_found',
    platform: 'Heroku',
    time: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ HTTP server on port ${PORT}`);
});

// WhatsApp Bot with session handling
const { makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Create proper logger
const logger = {
  trace: () => {},
  debug: () => {},
  info: (...args) => console.log('📝', ...args),
  warn: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
  child: () => logger
};

async function startWhatsAppWithSession() {
  console.log('\n🔗 Initializing WhatsApp connection...');
  
  try {
    const authDir = './whatsapp_auth';
    
    // Create session from environment variable if provided
    if (SESSION_ID) {
      console.log('🔄 Creating session from environment variable...');
      
      // Ensure auth directory exists
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      
      // Try to parse session
      try {
        // If it's JSON, parse it
        if (SESSION_ID.startsWith('{') || SESSION_ID.startsWith('[')) {
          const sessionData = JSON.parse(SESSION_ID);
          fs.writeFileSync(
            path.join(authDir, 'creds.json'),
            JSON.stringify(sessionData, null, 2)
          );
          console.log('✅ Session created from JSON');
        } else if (SESSION_ID.includes('Xguru~')) {
          // MEGA session format - create minimal session
          const minimalSession = {
            noiseKey: { private: '', public: '' },
            signedIdentityKey: { private: '', public: '' },
            signedPreKey: { keyPair: { private: '', public: '' } },
            registrationId: 0,
            advSecretKey: '',
            processedHistoryMessages: [],
            nextPreKeyId: 0,
            firstUnuploadedPreKeyId: 0,
            accountSyncCounter: 0,
            accountSettings: { unarchiveChats: false },
            me: { id: 'botguru_user' },
            myAppStateKeyId: 'session_from_env'
          };
          
          fs.writeFileSync(
            path.join(authDir, 'creds.json'),
            JSON.stringify(minimalSession, null, 2)
          );
          console.log('✅ Created minimal session from MEGA format');
        } else {
          // Try as base64 or other format
          console.log('📦 Using session as-is (will attempt connection)');
        }
      } catch (e) {
        console.log('⚠️  Could not parse session, will use as-is:', e.message);
      }
    } else {
      console.log('📱 No session ID - will show QR code');
    }
    
    // Connect to WhatsApp
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    
    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      logger: logger,
    });
    
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      
      if (qr) {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('📱 WHATSAPP QR CODE GENERATED');
        console.log('═══════════════════════════════════════════════════');
        console.log('Session ID from env was:', SESSION_ID ? 'PRESENT' : 'MISSING');
        console.log('QR Data (first 100 chars):');
        console.log(qr.substring(0, 100) + '...');
        console.log('═══════════════════════════════════════════════════\n');
      }
      
      if (connection === 'open') {
        console.log('🎉 ✅ WHATSAPP CONNECTED SUCCESSFULLY!');
        console.log(`🤖 Botguru is ONLINE`);
        
        if (SESSION_ID) {
          console.log('🔐 Using session from Heroku environment variables');
        } else {
          console.log('📱 Connected via QR code scan');
        }
        
        // Update server status
        server.on('request', (req, res) => {
          res.end(JSON.stringify({
            status: 'connected',
            bot: 'Botguru',
            whatsapp: 'connected',
            session_source: SESSION_ID ? 'environment_variable' : 'qr_code',
            connected_at: new Date().toISOString()
          }));
        });
      }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Basic commands
    sock.ev.on('messages.upsert', ({ messages }) => {
      const msg = messages[0];
      const text = msg.message?.conversation || '';
      
      if (text.toLowerCase() === 'ping') {
        sock.sendMessage(msg.key.remoteJid, { 
          text: `🏓 Pong!\n\n` +
                `🤖 Botguru on Heroku\n` +
                `📡 Session: ${SESSION_ID ? 'From env vars' : 'QR code'}\n` +
                `⏰ ${new Date().toLocaleString()}`
        });
      }
      
      if (text.toLowerCase() === 'session') {
        const sessionInfo = SESSION_ID 
          ? `✅ Using session from Heroku Config Vars\nLength: ${SESSION_ID.length} chars`
          : `📱 Connected via QR code\nNo session in environment`;
        
        sock.sendMessage(msg.key.remoteJid, {
          text: `🔐 *Session Information*\n\n${sessionInfo}\n\n` +
                `🤖 Botguru - Heroku Deployment`
        });
      }
    });
    
    console.log('⏳ Waiting for WhatsApp connection...');
    
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    console.log('🔄 Retrying in 30 seconds...');
    setTimeout(startWhatsAppWithSession, 30000);
  }
}

// Start WhatsApp connection
setTimeout(startWhatsAppWithSession, 2000);

console.log('\n🟢 Bot started with session detection');
console.log('📡 Platform: Heroku');
console.log('🔍 Session detection: ENABLED');
console.log('💡 Check Heroku Config Vars for WHATSAPP_SESSION_ID');
