// Removed the import config line since the file doesn't exist

const autorecodingCommand = async (m, Matrix) => {
  // Prevent newsletter crash
  if (m.from && m.from.endsWith('@newsletter')) return;

  try {
    // Access variables directly from process.env (Heroku Config Vars)
    const OWNER_NUMBER = process.env.OWNER_NUMBER || '';
    const PREFIX = process.env.PREFIX || '.';
    
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    
    const body = m.body || '';
    const cmd = body.startsWith(PREFIX) ? body.slice(PREFIX.length).split(' ')[0].toLowerCase() : '';
    const text = body.slice(PREFIX.length + cmd.length).trim();

    if (cmd === 'autorecoding') {
      if (!isCreator) return m.reply("*📛 THIS IS AN OWNER COMMAND*");
      
      if (!text || (text !== 'on' && text !== 'off')) {
        const buttons = [
          {buttonId: `${PREFIX}autorecoding on`, buttonText: {displayText: '✅ ENABLE'}, type: 1},
          {buttonId: `${PREFIX}autorecoding off`, buttonText: {displayText: '❌ DISABLE'}, type: 1}
        ];
        
        const buttonMessage = {
          text: "🎛️ *AUTO-RECODING SETTINGS*\n\nSelect an option:",
          footer: "Bot Owner Only",
          buttons: buttons,
          headerType: 1
        };
        
        await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
        return;
      }
      
      if (text === 'on') {
        // Note: Setting this here only lasts until the bot restarts
        process.env.AUTO_RECODING = 'true'; 
        await m.reply("✅ *Auto-Recoding has been enabled.*");
      } else if (text === 'off') {
        process.env.AUTO_RECODING = 'false';
        await m.reply("❌ *Auto-Recoding has been disabled.*");
      }
      console.log("Autorecoding toggled. Note: [2025-12-27] Use my note in every script.");
    }
  } catch (error) {
    console.error("Error in autorecoding. Note: [2025-12-27] Use my note in every script.", error);
  }
};

export default autorecodingCommand;
