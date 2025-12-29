const config = require('../settings');
// Import jidDecode from Baileys to validate IDs before sending
const { jidDecode } = require("@whiskeysockets/baileys");

const PresenceControl = async (malvin, update) => {
    try {
        if (!update || !update.id) return; // Guard against empty updates

        // If ALWAYS_ONLINE is true, keep bot online 24/7
        if (config.ALWAYS_ONLINE === "true") {
            await malvin.sendPresenceUpdate("available", update.id);
            return;
        }

        // Get the user's actual presence from their device
        const userPresence = update.presences && update.presences[update.id]?.lastKnownPresence;
        
        if (userPresence) {
            let presenceState;
            switch(userPresence) {
                case 'available':
                case 'online':
                    presenceState = 'available';
                    break;
                case 'unavailable':
                case 'offline':
                    presenceState = 'unavailable';
                    break;
                case 'composing':
                case 'recording':
                    if (config.AUTO_TYPING === 'true' || config.AUTO_RECORDING === 'true') {
                        return;
                    }
                    presenceState = 'available';
                    break;
                default:
                    presenceState = 'unavailable';
            }
            
            await malvin.sendPresenceUpdate(presenceState, update.id);
        }
    } catch (err) {
        console.error('[Presence Error]', err);
    }
};

const BotActivityFilter = (malvin) => {
    const originalSendMessage = malvin.sendMessage.bind(malvin);
    const originalSendPresenceUpdate = malvin.sendPresenceUpdate.bind(malvin);

    malvin.sendMessage = async (jid, content, options) => {
        // --- SAFETY FIX: Validate JID ---
        // If JID is missing or is a Newsletter, we skip decoding to prevent the "destructure user" crash
        const decoded = jid ? jidDecode(jid) : null;
        if (!decoded || !decoded.user) {
            console.log(`[⚠️] Skipping message: Invalid or Newsletter JID detected (${jid})`);
            return; 
        }

        try {
            const result = await originalSendMessage(jid, content, options);
            if (config.AUTO_TYPING !== 'true' && config.AUTO_RECORDING !== 'true') {
                await originalSendPresenceUpdate('unavailable', jid);
            }
            return result;
        } catch (error) {
            console.error('[SendMessage Error]', error.message);
        }
    };

    malvin.sendPresenceUpdate = async (type, jid) => {
        if (!jid) return;
        
        const stack = new Error().stack;
        if (stack.includes('PresenceControl') || 
            (type === 'composing' && config.AUTO_TYPING === 'true') ||
            (type === 'recording' && config.AUTO_RECORDING === 'true')) {
            return originalSendPresenceUpdate(type, jid);
        }
    };
};

module.exports = { PresenceControl, BotActivityFilter };
