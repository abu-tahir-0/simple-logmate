// Import the Logger class from the logger module
const Logger = require('./src/logger');

// Export the Logger class as the default export
// This allows users to import it using require('simple-logmate') 
module.exports = Logger;

// Define and export standard log levels as constants
// These levels follow common logging conventions and can be used
// to control the verbosity and severity of log messages
module.exports.LOG_LEVELS = {
    DEBUG: 'debug',  // For detailed debugging information
    INFO: 'info',    // For general information about program execution
    WARN: 'warn',    // For potentially harmful situations
    ERROR: 'error'   // For error events that might still allow the program to continue
}; 