// Functions module for Heroku
module.exports = {
    getBuffer: () => Buffer.from(''),
    getGroupAdmins: (participants) => participants?.filter(p => p.admin)?.map(p => p.id) || [],
    getRandom: (arr) => arr?.[Math.floor(Math.random() * (arr.length || 1))] || null,
    h2k: (num) => num >= 1000 ? (num/1000).toFixed(1) + 'K' : num.toString(),
    isUrl: (text) => {
        try { new URL(text); return true; } catch { return false; }
    },
    Json: (obj) => JSON.stringify(obj, null, 2),
};
