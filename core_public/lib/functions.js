// Functions module for Heroku deployment
// Provides minimal implementations to prevent errors

module.exports = {
    getBuffer: function(input) {
        if (typeof input === 'string') {
            return Buffer.from(input);
        }
        return Buffer.from('');
    },
    
    getGroupAdmins: function(participants) {
        if (!Array.isArray(participants)) return [];
        return participants
            .filter(p => p && p.admin)
            .map(p => p.id || p.jid);
    },
    
    getRandom: function(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    h2k: function(number) {
        if (typeof number !== 'number') number = parseInt(number) || 0;
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    },
    
    isUrl: function(text) {
        if (typeof text !== 'string') return false;
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    },
    
    Json: function(obj, indent = 2) {
        return JSON.stringify(obj, null, indent);
    },
    
    // Add more functions as needed
};
