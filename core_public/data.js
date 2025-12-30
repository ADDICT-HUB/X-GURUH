// Data module for Heroku deployment
// Provides minimal data structures to prevent errors

module.exports = {
    // Common data structures
    users: {},
    groups: {},
    settings: {},
    commands: {},
    
    // Methods
    get: function(key) {
        return this[key];
    },
    
    set: function(key, value) {
        this[key] = value;
        return true;
    },
    
    has: function(key) {
        return key in this;
    },
    
    delete: function(key) {
        delete this[key];
        return true;
    },
    
    // Add more data methods as needed
};
