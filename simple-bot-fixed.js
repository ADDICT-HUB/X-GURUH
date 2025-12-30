console.log('🤖 Botguru - Heroku WhatsApp Bot');
console.log('================================\n');

// HTTP server for Heroku (REQUIRED)
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: 'Botguru',
    platform: 'Heroku',
    whatsapp: 'connecting',
    time: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ HTTP server on port ${PORT}`);
  console.log(`🌐 Your bot is accessible`);
});

// WhatsApp Bot with proper logger
const { makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');

// Create a proper logger object
const logger = {
  trace: () => {},
  debug: () => {},
  info: (...args) => console.log('📝', ...args),
  warn: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
  fatal: (...args) => console.error('💀', ...args),
  child: () => logger // Add child method that baileys expects
};

async function connectWhatsApp() {
  console.log('\n🔗 Connecting to WhatsApp...');
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_auth');
    
    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false, // We'll handle QR manually
      logger: logger,
    });
    
    let qrCode = '';
    
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      
      if (qr) {
        qrCode = qr;
        console.log('\n═══════════════════════════════════════════════════');
        console.log('📱 WHATSAPP QR CODE DETECTED!');
        console.log('═══════════════════════════════════════════════════');
        console.log('QR Data (first 150 chars):');
        console.log(qr.substring(0, 150) + '...');
        console.log('═══════════════════════════════════════════════════');
        console.log('Instructions:');
        console.log('1. Go to https://qrcodemonkey.com/');
        console.log('2. Paste the QR data above');
        console.log('3. Generate QR image');
        console.log('4. Scan with WhatsApp');
        console.log('═══════════════════════════════════════════════════\n');
      }
      
      if (connection === 'open') {
        console.log('🎉 ✅ CONNECTED TO WHATSAPP!');
        console.log('🤖 Botguru is now ONLINE on Heroku');
        
        // Update server response
        server.on('request', (req, res) => {
          res.end(JSON.stringify({
            status: 'connected',
            bot: 'Botguru',
            whatsapp: 'connected',
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
        sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong! Botguru on Heroku! 🚀' });
        console.log('📨 Responded to ping command');
      }
      
      if (text.toLowerCase() === 'heroku') {
        sock.sendMessage(msg.key.remoteJid, { 
          text: `🤖 *Botguru on Heroku*\n\n` +
                `✅ Running in the cloud\n` +
                `📡 Platform: Heroku\n` +
                `🌐 Connected: ${new Date().toLocaleString()}\n` +
                `🚀 Powered by Node.js & Baileys`
        });
      }
    });
    
    console.log('⏳ Waiting for WhatsApp QR code...');
    
  } catch (error) {
    console.error('❌ WhatsApp connection error:', error.message);
  }
}

// Start WhatsApp connection
setTimeout(connectWhatsApp, 2000);

console.log('\n🟢 Bot process started successfully!');
console.log('📡 Platform: Heroku');
console.log('⚙️  Logger fixed - No more errors');
