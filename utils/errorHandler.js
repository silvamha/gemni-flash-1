/**
 * @fileoverview Error Handler - Centralized error handling utility
 */

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
    constructor(message, type = 'GENERAL_ERROR', details = {}) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Handles errors in a consistent way across the application
 * @param {Error} error - The error to handle
 * @param {Object} options - Additional options for error handling
 * @param {boolean} options.showUser - Whether to show error to user
 * @param {boolean} options.logError - Whether to log error
 * @returns {Object} Formatted error object
 */
export const handleError = (error, options = { showUser: true, logError: true }) => {
    const errorObj = {
        message: error.message || 'An unexpected error occurred',
        type: error instanceof AppError ? error.type : 'UNKNOWN_ERROR',
        timestamp: error instanceof AppError ? error.timestamp : new Date().toISOString(),
        details: error instanceof AppError ? error.details : {}
    };

    if (options.logError) {
        console.error('Error:', {
            ...errorObj,
            stack: error.stack
        });
    }

    if (options.showUser) {
        // You can implement UI notification here
        // For now, we'll just return the error object
        return {
            message: errorObj.message,
            type: errorObj.type
        };
    }

    return errorObj;
};

/**
 * Creates a new AppError
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} details - Additional error details
 * @returns {AppError}
 */
export const createError = (message, type, details) => {
    return new AppError(message, type, details);
};
