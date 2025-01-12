const fs = require('fs');
const path = require('path');
const { format } = require('./utils');

/**
 * Logger class providing flexible logging functionality with multiple transports
 * and log rotation capabilities.
 */
class Logger {
    /**
     * Creates a new Logger instance
     * @param {Object} options - Configuration options
     * @param {string} [options.level='info'] - Minimum log level
     * @param {string} [options.format='[{timestamp}] {level}: {message}'] - Log message format
     * @param {string} [options.filePath=null] - Path to log file
     * @param {number} [options.maxFileSize=1048576] - Max file size in bytes before rotation
     * @param {string[]} [options.transports=['console']] - Enabled transport types
     */
    constructor(options = {}) {
        // Initialize configuration with defaults
        this.level = options.level || 'info';
        this.format = options.format || '[{timestamp}] {level}: {message}';
        this.filePath = options.filePath || null;
        this.maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB default
        this.transports = options.transports || ['console'];

        // Queue for managing asynchronous file writes
        this.logQueue = [];
        this.isWriting = false;

        // Set up file logging if enabled
        if (this.filePath && this.transports.includes('file')) {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    /**
     * Generates a formatted timestamp string in local time
     * @returns {string} Formatted timestamp (YYYY-MM-DD HH:mm:ss.SSS)
     */
    getLocalTimestamp() {
        const date = new Date();
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
            hour12: false
        }).replace(',', '');
    }

    /**
     * Core logging function that handles message formatting and transport routing
     * @param {string} level - Log level (debug, info, warn, error)
     * @param {string} message - Log message content
     */
    log(level, message) {
        if (this.shouldLog(level)) {
            const timestamp = this.getLocalTimestamp();
            const formattedMessage = format(this.format, { timestamp, level, message });

            // Route message to each enabled transport
            this.transports.forEach(transport => {
                if (transport === 'console') {
                    // Use appropriate console method based on level
                    const consoleMethod = level === 'error' ? 'error' :
                        level === 'warn' ? 'warn' : 'log';
                    console[consoleMethod](formattedMessage);
                } else if (transport === 'file' && this.filePath) {
                    this.logToFile(formattedMessage);
                }
            });
        }
    }

    /**
     * Queues a message for writing to the log file
     * @param {string} message - Formatted log message
     */
    logToFile(message) {
        this.logQueue.push(message);
        if (!this.isWriting) {
            this.isWriting = true;
            this.writeLogs();
        }
    }

    /**
     * Processes queued log messages and writes them to file
     * Handles file rotation when size limit is reached
     */
    async writeLogs() {
        try {
            while (this.logQueue.length > 0) {
                const message = this.logQueue.shift();
                await fs.promises.appendFile(this.filePath, message + '\n');
                await this.checkFileSize();
            }
        } catch (error) {
            console.error('Error writing to log file:', error);
        } finally {
            this.isWriting = false;
        }
    }

    /**
     * Checks log file size and rotates if necessary
     * @throws {Error} If file operations fail
     */
    async checkFileSize() {
        try {
            const stats = await fs.promises.stat(this.filePath);
            if (stats.size > this.maxFileSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFilePath = this.filePath.replace(/(\.\w+)?$/, `-${timestamp}$1`);
                await fs.promises.rename(this.filePath, rotatedFilePath);
            }
        } catch (error) {
            console.error('Error during log rotation:', error);
        }
    }

    /**
     * Determines if a message should be logged based on level hierarchy
     * @param {string} level - Log level to check
     * @returns {boolean} Whether the message should be logged
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    // Convenience methods for different log levels
    info(message) { this.log('info', message); }
    warn(message) { this.log('warn', message); }
    error(message) { this.log('error', message); }
    debug(message) { this.log('debug', message); }
}

module.exports = Logger;