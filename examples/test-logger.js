const Logger = require('../index');

// Test Case 1: Basic logging with different levels
try {
    const logger = new Logger({
        level: 'debug',
        format: '[{timestamp}] [{level}] {message}',
        transports: ['console']
    });

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.error(new Error('Test error'));

} catch (error) {
    console.error('Test Case 1 failed:', error);
}

// Test Case 2: File logging with rotation
try {
    const logger = new Logger({
        level: 'info',
        format: '[{timestamp}] [{level}] {message}',
        filePath: './logs/test.log',
        maxFileSize: 1024, // Small size to test rotation
        transports: ['file', 'console']
    });

    // Write multiple logs to trigger rotation
    for (let i = 0; i < 100; i++) {
        logger.info(`Test message ${i}`);
    }

} catch (error) {
    console.error('Test Case 2 failed:', error);
}

// Test Case 3: HTTP request logging
try {
    const logger = new Logger({
        level: 'debug',
        httpRequest: true,
        transports: ['console']
    });

    // Simulate HTTP request
    const mockReq = {
        method: 'GET',
        url: '/test',
        headers: {
            'user-agent': 'test-agent'
        },
        connection: {
            remoteAddress: '127.0.0.1'
        }
    };

    const mockRes = {
        statusCode: 200
    };

    logger.logRequest(mockReq, mockRes, 100);

} catch (error) {
    console.error('Test Case 3 failed:', error);
} 