const fs = require('fs');
const path = require('path');
const { format } = require('./utils');

// ANSI color codes for different log levels
const colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'   // Reset color
};

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
     * @param {boolean} [options.httpRequest=false] - Enable automatic HTTP request logging
     */
    constructor(options = {}) {
        // Initialize configuration with defaults
        this.level = options.level || 'info';
        this.format = options.format || '[{timestamp}] {level}: {message}';
        this.filePath = options.filePath || null;
        this.maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB default
        this.transports = options.transports || ['console'];
        this.httpRequest = options.httpRequest || false;

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

        // Set up automatic HTTP request logging if enabled
        if (this.httpRequest) {
            this.setupAutoRequestLogging();
        }
    }

    /**
     * Sets up automatic HTTP request logging middleware
     * @private
     */
    setupAutoRequestLogging() {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
            try {
                const http = require('http');
                const originalCreateServer = http.createServer;

                http.createServer = (...args) => {
                    const server = originalCreateServer.apply(http, args);
                    server.on('request', (req, res) => {
                        const start = Date.now();
                        res.on('finish', () => {
                            const responseTime = Date.now() - start;
                            this.logRequest(req, res, responseTime);
                        });
                    });
                    return server;
                };
            } catch (error) {
                this.warn('Failed to setup automatic HTTP request logging:', error);
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
     * @param {string|Error} message - Log message content or Error object
     */
    log(level, ...args) {
        if (this.shouldLog(level)) {
            const timestamp = this.getLocalTimestamp();
            let formattedMessage;

            // Process all arguments to create a complete message
            const processedMessage = args.map(arg => {
                if (arg instanceof Error) {
                    const errorDetails = {
                        name: arg.name,
                        message: arg.message,
                        stack: arg.stack
                    };
                    return `${errorDetails.name}: ${errorDetails.message}\n${errorDetails.stack}`;
                }
                return String(arg);
            }).join(' ');

            formattedMessage = format(this.format, {
                timestamp,
                level,
                message: processedMessage
            });

            // Route message to each enabled transport
            this.transports.forEach(transport => {
                if (transport === 'console') {
                    // Use appropriate console method based on level with colors
                    const consoleMethod = level === 'error' ? 'error' :
                        level === 'warn' ? 'warn' : 'log';

                    // Log the formatted message first
                    console[consoleMethod](colors[level] + formattedMessage + colors.reset);

                    // If there are any error objects, log them separately to preserve stack traces
                    args.forEach(arg => {
                        if (arg instanceof Error) {
                            console[consoleMethod](colors[level] + 'Stack trace:' + colors.reset);
                            console[consoleMethod](arg);
                        }
                    });
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

    /**
     * Logs HTTP request details
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {number} responseTime - Response time in milliseconds
     */
    logRequest(req, res, responseTime) {
        const requestLog = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        };

        const message = `${requestLog.method} ${requestLog.url} ${requestLog.status} ${requestLog.responseTime}`;
        this.info(message);

        // Log detailed request info at debug level
        this.debug('Request Details:', JSON.stringify(requestLog, null, 2));
    }

    // Convenience methods for different log levels
    info(...args) { this.log('info', ...args); }
    warn(...args) { this.log('warn', ...args); }
    error(...args) { this.log('error', ...args); }
    debug(...args) { this.log('debug', ...args); }
}

module.exports = Logger;