// Import the Logger class from the main module
const Logger = require('../index');

// Create a new logger instance with custom configuration
// - level: 'debug' enables all log levels (debug, info, warn, error)
// - format: Customizes the log message format with timestamp and level
// - filePath: Specifies where log files will be stored
// - maxFileSize: Sets maximum log file size before rotation (5MB)
// - transports: Enables both console and file logging
const logger = new Logger({
    level: 'debug',
    format: '[{timestamp}] [{level}] {message}',
    filePath: './logs/app.log',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    transports: ['console', 'file']
});

// Basic logging examples demonstrating different log levels
// Info level - For general application information
logger.info('Application started');
// Debug level - For detailed debugging information
logger.debug('Debug message');
// Warning level - For potentially harmful situations
logger.warn('Warning: Resource usage high');
// Error level - For error events that might still allow the app to continue
logger.error('Error: Connection failed');

/**
 * Test function to demonstrate log rotation functionality
 * Creates multiple log entries in rapid succession to trigger log rotation
 * when the log file exceeds maxFileSize
 */
async function testLogRotation() {
    // Generate 100 log messages of each level
    for (let i = 0; i < 100; i++) {
        // Log messages with incrementing counter
        logger.info(`Log message ${i}`);
        logger.debug(`Debug message ${i}`);
        logger.warn(`Warning message ${i}`);
        logger.error(`Error message ${i}`);

        // Add small delay between logs to prevent overwhelming the system
        // and to make the rotation effect more visible
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

// Execute the test function and handle any errors
testLogRotation().catch(console.error);