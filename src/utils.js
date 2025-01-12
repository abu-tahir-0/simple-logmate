/**
 * Formats a template string by replacing placeholders with corresponding values
 * @param {string} template - Template string containing placeholders in {key} format
 * @param {Object} data - Object containing key-value pairs to replace placeholders
 * @returns {string} Formatted string with placeholders replaced by values
 * @example
 * format('[{timestamp}] {level}: {message}', {
 *   timestamp: '2023-12-25 10:30:45.123', 
 *   level: 'info',
 *   message: 'Simple Logmate'
 * })
 * // Returns: '[2023-12-25 10:30:45.123] info: Simple Logmate'
 */
function format(template, data) {
    // Use regex to find all placeholders in format {key}
    // Replace each match with corresponding value from data object
    // If key doesn't exist in data, replace with empty string
    return template.replace(
        /{(\w+)}/g,
        (match, key) => data.hasOwnProperty(key) ? data[key] : ''
    );
}

module.exports = { format };