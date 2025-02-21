# Simple Logmate 

A flexible and powerful logging utility for Node.js applications with support for multiple transports, log rotation, custom formatting, and HTTP request logging.

## Features

- **Multiple Log Levels**: Supports `debug`, `info`, `warn`, and `error` levels
- **Custom Timestamp Formats**: Include timestamps in each log message with customizable formats
- **Configurable Message Formatting**: Define how log messages should look with template strings
- **File Logging with Rotation**: Automatic log file rotation based on file size
- **Multiple Transport Support**: Log to different destinations (console, file) simultaneously
- **Asynchronous File Writing**: Non-blocking logging operations for better performance
- **HTTP Request Logging**: Built-in support for logging HTTP requests with detailed information
- **Zero Dependencies**: Lightweight and self-contained

## Installation
```bash
npm install simple-logmate
# or using yarn
yarn add simple-logmate
```

## Quick Start

```javascript
const Logger = require('simple-logmate');

// Create a new logger instance with HTTP request logging enabled
const logger = new Logger({
    level: 'debug',
    format: '[{timestamp}] [{level}] {message}',
    filePath: './logs/app.log',
    maxFileSize: 1024 * 1024, // 1MB
    transports: ['console', 'file'],
    httpRequest: true  // Enable HTTP request logging
});

// Basic logging
logger.info('Application started');
logger.debug('Debug information');
logger.warn('Warning message');
logger.error('Error occurred', new Error('Something went wrong'));

// HTTP Request logging will be automatic if httpRequest is true
app.use((req, res, next) => next());
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | string | `'info'` | Minimum log level (`'debug'`, `'info'`, `'warn'`, `'error'`) |
| `format` | string | `'[{timestamp}] {level}: {message}'` | Message format template |
| `filePath` | string | - | Path to log file (required for file transport) |
| `maxFileSize` | number | `1048576` (1MB) | Maximum size of log file before rotation |
| `transports` | string[] | `['console']` | Array of transport types (`'console'`, `'file'`) |
| `httpRequest` | boolean | `false` | Enable automatic HTTP request logging |

## Advanced Usage

### HTTP Request Logging

The logger includes built-in support for HTTP request logging. There are two ways to use it:

1. **Automatic Mode** (Recommended):
```javascript
const express = require('express');
const Logger = require('simple-logmate');

const app = express();
const logger = new Logger({
    level: 'debug',
    transports: ['console', 'file'],
    filePath: './logs/access.log',
    httpRequest: true  // Enable automatic HTTP request logging
});

// No additional middleware needed - logging happens automatically
app.use(express.json());
app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});
```

2. **Manual Mode**:
```javascript
const logger = new Logger({
    level: 'debug',
    transports: ['console', 'file'],
    filePath: './logs/access.log',
    httpRequest: false  // Disable automatic logging
});

// Manual middleware for request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.logRequest(req, res, responseTime);
    });
    next();
});
```

Example outputs remain the same for both modes:
```
// Info level output:
[2024-03-21 14:30:45.123] info: GET /api/users 200 150ms

// Debug level output:
[2024-03-21 14:30:45.123] debug: Request Details: {
  "method": "GET",
  "url": "/api/users",
  "status": 200,
  "responseTime": "150ms",
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1"
}
```

### Log Rotation Example

```javascript
const logger = new Logger({
    level: 'info',
    filePath: './logs/app.log',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    transports: ['file']
});

async function testLogRotation() {
    for (let i = 0; i < 1000; i++) {
        logger.info(`Log message ${i}`);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

testLogRotation().catch(console.error);
```

### Custom Format Example

```javascript
const logger = new Logger({
    format: '[{timestamp}] [{level}] [{service}] {message}',
    level: 'debug',
    transports: ['console'],
    metadata: {
        service: 'user-service'
    }
});

logger.info('User logged in', { userId: 123 });
// Output: [2024-03-21T10:30:00Z] [INFO] [user-service] User logged in {"userId":123}
```

## Error Handling

The logger automatically handles errors and stack traces:

```javascript
try {
    throw new Error('Database connection failed');
} catch (error) {
    logger.error('Failed to connect to database', error);
}
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/abu-tahir-0/simple-logmate/issues) on GitHub.

## Author

Abu Tahir
