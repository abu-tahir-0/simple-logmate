/**
 * Type definitions for utility functions
 */

/**
 * Format data object for template string
 */
export interface FormatData {
    timestamp?: string;
    level?: string;
    message?: string;
    [key: string]: any;  // Allow additional properties
}

/**
 * Formats a template string by replacing placeholders with corresponding values
 * @param template - Template string containing placeholders in {key} format
 * @param data - Object containing key-value pairs to replace placeholders
 * @returns Formatted string with placeholders replaced by values
 */
export function format(template: string, data: FormatData): string; 