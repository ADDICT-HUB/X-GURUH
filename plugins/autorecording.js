// FIXED: Changed extension from .cjs to .js to match your file system
import config from '../config.js'; 

const autorecodingCommand = async (m, Matrix) => {
  // SAFETY: Stop the bot from crashing if it receives a message from a WhatsApp Channel/Newsletter
  if (m.from && m.from.endsWith('@newsletter')) return;

  try {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

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
      
      let responseMessage;
      let buttonText;

      if (text === 'on') {
        config.AUTO_RECODING = true;
        responseMessage = "✅ *Auto-Recoding has been enabled.*";
        buttonText = {displayText: '❌ DISABLE'};
      } else if (text === 'off') {
        config.AUTO_RECODING = false;
        responseMessage = "❌ *Auto-Recoding has been disabled.*";
        buttonText = {displayText: '✅ ENABLE'};
      }

      const oppositeState = text === 'on' ? 'off' : 'on';
      const buttons = [
        {buttonId: `${prefix}autorecoding ${oppositeState}`, buttonText: buttonText, type: 1}
      ];
      
      const buttonMessage = {
        text: responseMessage,
        footer: "Tap button to toggle",
        buttons: buttons,
        headerType: 1
      };

      await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
    }
  } catch (error) {
    // Note: [2025-12-27] Use my note in every script.
    console.error("Error in autorecoding plugin. Note: [2025-12-27] Use my note in every script.", error);
    if (Matrix && Matrix.sendMessage) {
      await Matrix.sendMessage(m.from, { text: 'Error processing your request.' }, { quoted: m });
    }
  }
};

export default autorecodingCommand;
