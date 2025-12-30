console.log('🤖 Botguru - Simple Working Bot');
console.log('===============================\n');

// HTTP server for Heroku (REQUIRED)
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: 'Botguru',
    platform: 'Heroku',
    time: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ HTTP server on port ${PORT}`);
  console.log(`🌐 Access: https://your-app.herokuapp.com`);
});

// WhatsApp Bot
const { makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');

async function connectWhatsApp() {
  console.log('\n🔗 Connecting to WhatsApp...');
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_auth');
    
    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: true,
      logger: { level: 'error' }, // Simple logger, no pino issues
    });
    
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      
      if (qr) {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('📱 WHATSAPP QR CODE DETECTED');
        console.log('═══════════════════════════════════════════════════');
        console.log('QR length:', qr.length, 'characters');
        console.log('First 100 chars:', qr.substring(0, 100));
        console.log('═══════════════════════════════════════════════════\n');
      }
      
      if (connection === 'open') {
        console.log('🎉 ✅ CONNECTED TO WHATSAPP!');
        console.log('🤖 Bot is ONLINE on Heroku');
      }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Simple ping command
    sock.ev.on('messages.upsert', ({ messages }) => {
      const msg = messages[0];
      const text = msg.message?.conversation || '';
      
      if (text.toLowerCase() === 'ping') {
        sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong! From Heroku! 🚀' });
        console.log('📨 Responded to ping');
      }
    });
    
    console.log('⏳ Waiting for WhatsApp connection...');
    
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
  }
}

// Start WhatsApp after delay
setTimeout(connectWhatsApp, 2000);

console.log('\n🟢 Bot process started successfully!');
console.log('📡 Platform: Heroku');
console.log('⚙️  No module interception = No pino errors');
