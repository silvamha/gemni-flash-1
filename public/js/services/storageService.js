/**
 * @fileoverview Storage Service - Handles all data persistence operations
 * Manages both localStorage and future database interactions
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique identifier for the message
 * @property {string} content - Content of the message
 * @property {string} sender - Either 'user' or 'bot'
 * @property {string} timestamp - ISO string of when message was sent
 */

const STORAGE_KEY = 'chat_messages';

/**
 * Save a message to localStorage
 * @param {Object} message - Message object with sender and content
 */
export const saveMessage = (message) => {
    const messages = getAllMessages();
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
};

/**
 * Get all messages from localStorage
 * @returns {Array} Array of message objects
 */
export const getAllMessages = () => {
    const messages = localStorage.getItem('messages');
    return messages ? JSON.parse(messages) : [];
};

/**
 * Clears all chat messages from localStorage
 * @returns {Promise<void>}
 */
export const clearAllMessages = async () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing messages:', error);
        throw error;
    }
};
