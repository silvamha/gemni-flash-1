/**
 * @fileoverview Memory Service - Helps Harper access and understand her chat history
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';
import Logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'database', 'chats.db');

class MemoryService {
    constructor() {
        try {
            this.db = new Database(dbPath, { readonly: true }); // Read-only for safety
            Logger.system('Memory service connected to database');
        } catch (error) {
            Logger.error('Failed to connect to memory database: ' + error.message);
            throw error;
        }
    }

    /**
     * Get recent chat context for a session
     * @param {string} sessionId - The session to get context for
     * @param {number} limit - Maximum number of messages to retrieve
     * @returns {Array} Recent messages with context
     */
    async getRecentContext(sessionId, limit = 10) {
        try {
            const stmt = this.db.prepare(`
                SELECT sender, content, timestamp
                FROM chats 
                WHERE session_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            `);
            
            const messages = stmt.all(sessionId, limit);
            return messages.reverse(); // Return in chronological order
        } catch (error) {
            Logger.error('Error retrieving context: ' + error.message);
            return []; // Return empty array on error to not break functionality
        }
    }

    /**
     * Search for specific topics or keywords in past conversations
     * @param {string} sessionId - The session to search in
     * @param {string} query - The search term
     * @returns {Array} Relevant messages
     */
    async searchMemories(sessionId, query) {
        try {
            const stmt = this.db.prepare(`
                SELECT sender, content, timestamp
                FROM chats 
                WHERE session_id = ?
                AND content LIKE ?
                ORDER BY timestamp DESC
                LIMIT 5
            `);
            
            return stmt.all(sessionId, `%${query}%`);
        } catch (error) {
            Logger.error('Error searching memories: ' + error.message);
            return []; // Return empty array on error
        }
    }

    /**
     * Get conversation summary statistics
     * @param {string} sessionId - The session to analyze
     * @returns {Object} Conversation statistics
     */
    async getConversationStats(sessionId) {
        try {
            const stats = {
                totalMessages: 0,
                userMessages: 0,
                botMessages: 0,
                firstInteraction: null,
                lastInteraction: null
            };

            const countStmt = this.db.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN sender = 'user' THEN 1 ELSE 0 END) as user_msgs,
                    SUM(CASE WHEN sender = 'bot' THEN 1 ELSE 0 END) as bot_msgs,
                    MIN(timestamp) as first_msg,
                    MAX(timestamp) as last_msg
                FROM chats 
                WHERE session_id = ?
            `);

            const result = countStmt.get(sessionId);
            
            stats.totalMessages = result.total;
            stats.userMessages = result.user_msgs;
            stats.botMessages = result.bot_msgs;
            stats.firstInteraction = result.first_msg;
            stats.lastInteraction = result.last_msg;

            return stats;
        } catch (error) {
            Logger.error('Error getting conversation stats: ' + error.message);
            return null;
        }
    }
}

// Export a singleton instance
export default new MemoryService();
