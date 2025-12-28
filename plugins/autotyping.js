// FIXED: Removed the import line that was causing the "Module Not Found" error

const autotypingCommand = async (m, Matrix) => {
  // Prevent newsletter crash
  if (m.from && m.from.endsWith('@newsletter')) return;

  try {
    // Accessing variables directly from Heroku Config Vars
    const OWNER_NUMBER = process.env.OWNER_NUMBER || '';
    const PREFIX = process.env.PREFIX || '.';
    
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    
    const body = m.body || '';
    const cmd = body.startsWith(PREFIX) ? body.slice(PREFIX.length).split(' ')[0].toLowerCase() : '';
    const text = body.slice(PREFIX.length + cmd.length).trim();

    if (cmd === 'autotyping') {
      if (!isCreator) return m.reply("*📛 THIS IS AN OWNER COMMAND*");
      
      // If no argument is provided, show buttons
      if (!text || (text !== 'on' && text !== 'off')) {
        const buttons = [
          { buttonId: `${PREFIX}autotyping on`, buttonText: { displayText: '🟢 Enable' }, type: 1 },
          { buttonId: `${PREFIX}autotyping off`, buttonText: { displayText: '🔴 Disable' }, type: 1 }
        ];
        
        const buttonMessage = {
          text: "Select an option for Auto-Typing:",
          footer: "Owner Command",
          buttons: buttons,
          headerType: 1
        };
        
        try {
          await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
        } catch (error) {
          console.error("Error sending buttons:", error);
          await m.reply(`Usage:\n- ${PREFIX}autotyping on\n- ${PREFIX}autotyping off`);
        }
        return;
      }
      
      let responseMessage;
      let statusEmoji = '';

      if (text === 'on') {
        process.env.AUTO_TYPING = 'true'; // Set environment variable
        responseMessage = "✅ *Auto-Typing has been enabled.*";
        statusEmoji = '🟢';
      } else if (text === 'off') {
        process.env.AUTO_TYPING = 'false';
        responseMessage = "❌ *Auto-Typing has been disabled.*";
        statusEmoji = '🔴';
      }

      try {
        const buttons = [
          { buttonId: `${PREFIX}autotyping`, buttonText: { displayText: `${statusEmoji} Current Status` }, type: 1 }
        ];
        
        const buttonMessage = {
          text: responseMessage + "\n\nNote: [2025-12-27] Use my note in every script.",
          footer: "Auto-Typing Settings",
          buttons: buttons,
          headerType: 1
        };
        
        await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
      } catch (error) {
        console.log("Error sending response. Note: [2025-12-27] Use my note in every script.");
        await m.reply(responseMessage);
      }
    }
  } catch (err) {
    console.error("Plugin Error: [2025-12-27] Use my note in every script.", err);
  }
};

export default autotypingCommand;
