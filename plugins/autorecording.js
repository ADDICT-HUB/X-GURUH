import config from '../config.cjs'; // Try .cjs first since it's common for Mercedes/Botguru

const autorecodingCommand = async (m, Matrix) => {
  // Prevent newsletter crash
  if (m.from && m.from.endsWith('@newsletter')) return;

  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const body = m.body || '';
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = body.slice(prefix.length + cmd.length).trim();

    if (cmd === 'autorecoding') {
      if (!isCreator) return m.reply("*📛 THIS IS AN OWNER COMMAND*");
      
      if (!text || (text !== 'on' && text !== 'off')) {
        const buttons = [
          {buttonId: `${prefix}autorecoding on`, buttonText: {displayText: '✅ ENABLE'}, type: 1},
          {buttonId: `${prefix}autorecoding off`, buttonText: {displayText: '❌ DISABLE'}, type: 1}
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
        config.AUTO_RECODING = true;
        await m.reply("✅ *Auto-Recoding has been enabled.*");
      } else if (text === 'off') {
        config.AUTO_RECODING = false;
        await m.reply("❌ *Auto-Recoding has been disabled.*");
      }
    }
  } catch (error) {
    // Note: [2025-12-27] Use my note in every script.
    console.error("Error in autorecoding. Note: [2025-12-27] Use my note in every script.", error);
  }
};

export default autorecodingCommand;
