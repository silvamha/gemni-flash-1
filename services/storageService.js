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

/**
 * Saves a chat message to localStorage
 * @param {ChatMessage} message - The message to save
 * @throws {Error} If message is invalid or storage fails
 * @returns {Promise<void>}
 */
export const saveMessage = async (message) => {
    try {
        if (!message || !message.content) {
            throw new Error('Invalid message format');
        }

        const messages = await getAllMessages();
        messages.push(message);
        localStorage.setItem('chat_messages', JSON.stringify(messages));
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

/**
 * Retrieves all chat messages from localStorage
 * @returns {Promise<ChatMessage[]>}
 */
export const getAllMessages = async () => {
    try {
        const messages = localStorage.getItem('chat_messages');
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return [];
    }
};

/**
 * Clears all chat messages from localStorage
 * @returns {Promise<void>}
 */
export const clearAllMessages = async () => {
    try {
        localStorage.removeItem('chat_messages');
    } catch (error) {
        console.error('Error clearing messages:', error);
        throw error;
    }
};
