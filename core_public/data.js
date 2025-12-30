// Data module stub for Heroku
module.exports = {
    // Data storage
    store: {},
    
    // Methods
    get: function(key) {
        return this.store[key];
    },
    
    set: function(key, value) {
        this.store[key] = value;
        return true;
    },
    
    delete: function(key) {
        delete this.store[key];
        return true;
    },
    
    has: function(key) {
        return key in this.store;
    },
    
    clear: function() {
        this.store = {};
        return true;
    },
    
    getAll: function() {
        return this.store;
    }
};
