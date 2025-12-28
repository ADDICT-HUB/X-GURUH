// Note: [2025-12-27] Use my note in every script.

const config = {
  // ===== BOT CORE SETTINGS =====
  SESSION_ID: process.env.SESSION_ID || "", 
  PREFIX: process.env.PREFIX || ".", 
  CHATBOT: process.env.CHATBOT || "true", 
  BOT_NAME: process.env.BOT_NAME || "Bot GURU", 
  MODE: process.env.MODE || "public", 
  REPO: process.env.REPO || "https://github.com/ADDICT-HUB/Botguru", 
  PAIRING_CODE: process.env.PAIRING_CODE || 'true', 
  BAILEYS: process.env.BAILEYS || "@whiskeysockets/baileys",

  // ===== OWNER & DEVELOPER SETTINGS =====
  OWNER_NUMBER: process.env.OWNER_NUMBER || "254116284050",
  OWNER_NAME: process.env.OWNER_NAME || "GURU",
  DEV: "254116284050",
  DEVELOPER_NUMBER: '254116284050@s.whatsapp.net',
  
  // ===== AUDIO & MEDIA =====
  MENU_AUDIO_URL: process.env.MENU_AUDIO_URL || 'https://files.catbox.moe/qiml76.mp3',
  AUDIO_URL: process.env.AUDIO_URL || 'https://files.catbox.moe/qiml76.mp3',
  NEWSLETTER_JID: process.env.NEWSLETTER_JID || '120363417996705218@newsletter',

  // ===== AUTO-RESPONSE SETTINGS =====
  AUTO_REPLY: "true",
  AUTO_STATUS_REPLY: "true",
  AUTO_STATUS_MSG: "*Just seen ur status 😆 🤖*",
  READ_MESSAGE: "true",
  REJECT_MSG: "*📵 Calls are not allowed on this number. 🚫*",
  ALIVE_IMG: "https://files.catbox.moe/rz7kac.jpg",
  LIVE_MSG: "> ʙᴏᴛ ɪs sᴘᴀʀᴋɪɴɢ ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ᴀʟɪᴠᴇ\n> ɢɪᴛʜᴜʙ : github.com/ADDICT-HUB/Botguru",

  // ===== AUTOMATION =====
  AUTO_REACT: "true",
  OWNER_REACT: "true",
  AUTO_RECORDING: "true",
  AUTO_TYPING: "true",
  AUTO_STICKER: "true",
  STICKER_NAME: "BOT GURU",

  // ===== SECURITY & ANTI-FEATURES =====
  ANTI_DELETE: "true",
  ANTI_CALL: "true",
  ANTI_LINK: "true",
  ANTI_BOT: "true",

  // ===== BOT BEHAVIOR =====
  PUBLIC_MODE: "true",
  ALWAYS_ONLINE: "true",
  AUTO_STATUS_SEEN: "true",
  AUTO_BIO: "true",
  AUTO_BIO_TEXT: "BOT GURU | Time: {time}",
  TIMEZONE: "Africa/Nairobi",
  version: "1.5.0"
};

module.exports = config;
