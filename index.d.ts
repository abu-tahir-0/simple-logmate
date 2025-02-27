// Type definitions for simple-logmate
// Project: https://github.com/yourusername/simple-logmate
// Definitions by: Your Name

declare module 'simple-logmate' {
    export interface LoggerOptions {
        /** Minimum log level. Defaults to 'info' */
        level?: 'debug' | 'info' | 'warn' | 'error';
        /** Log message format with placeholders. Defaults to '[{timestamp}] {level}: {message}' */
        format?: string;
        /** Path to log file. Defaults to null */
        filePath?: string | null;
        /** Maximum file size in bytes before rotation. Defaults to 1MB */
        maxFileSize?: number;
        /** Enabled transport types. Defaults to ['console'] */
        transports?: Array<'console' | 'file'>;
        /** Enable automatic HTTP request logging. Defaults to false */
        httpRequest?: boolean;
    }

    export interface RequestLogDetails {
        method: string;
        url: string;
        status: number;
        responseTime: string;
        userAgent?: string;
        ip: string;
    }

    export class Logger {
        constructor(options?: LoggerOptions);

        /** Current log level */
        level: string;
        /** Current log format */
        format: string;
        /** Path to log file */
        filePath: string | null;
        /** Maximum file size before rotation */
        maxFileSize: number;
        /** Enabled transports */
        transports: Array<'console' | 'file'>;
        /** HTTP request logging enabled */
        httpRequest: boolean;

        /**
         * Core logging function
         * @param level - Log level
         * @param args - Messages or Error objects to log
         */
        log(level: string, ...args: Array<string | Error>): void;

        /**
         * Log at INFO level
         * @param args - Messages or Error objects to log
         */
        info(...args: Array<string | Error>): void;

        /**
         * Log at WARN level
         * @param args - Messages or Error objects to log
         */
        warn(...args: Array<string | Error>): void;

        /**
         * Log at ERROR level
         * @param args - Messages or Error objects to log
         */
        error(...args: Array<string | Error>): void;

        /**
         * Log at DEBUG level
         * @param args - Messages or Error objects to log
         */
        debug(...args: Array<string | Error>): void;

        /**
         * Log HTTP request details
         * @param req - HTTP Request object
         * @param res - HTTP Response object
         * @param responseTime - Response time in milliseconds
         */
        logRequest(req: any, res: any, responseTime: number): void;

        private shouldLog(level: string): boolean;
        private getLocalTimestamp(): string;
        private logToFile(message: string): void;
        private writeLogs(): Promise<void>;
        private checkFileSize(): Promise<void>;
        private setupAutoRequestLogging(): void;
    }

    export const LOG_LEVELS: {
        readonly DEBUG: 'debug';
        readonly INFO: 'info';
        readonly WARN: 'warn';
        readonly ERROR: 'error';
    };

    export default Logger;
} 