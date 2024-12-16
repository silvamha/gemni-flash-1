/**
 * @fileoverview Storage Service - Handles all data persistence operations
 * Manages localStorage interactions for chat messages
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
    try {
        const messages = getAllMessages();
        const enhancedMessage = {
            id: crypto.randomUUID(),
            content: message.content,
            sender: message.sender,
            timestamp: new Date().toISOString()
        };
        messages.push(enhancedMessage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        return enhancedMessage;
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

/**
 * Get all messages from localStorage
 * @returns {Array} Array of message objects
 */
export const getAllMessages = () => {
    try {
        const messages = localStorage.getItem(STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
};

/**
 * Clears all chat messages from localStorage
 */
export const clearAllMessages = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing messages:', error);
        throw error;
    }
};
