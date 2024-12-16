/**
 * @fileoverview Service for managing chat messages using SQLite database
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'chats.db');

class ChatService {
    constructor() {
        this.db = new Database(dbPath);
        console.log(chalk.blue('📱 Chat service connected to database'));
    }

    /**
     * Save a message to the database
     */
    saveMessage(sessionId, sender, content) {
        try {
            const stmt = this.db.prepare(
                'INSERT INTO chats (session_id, sender, content) VALUES (?, ?, ?)'
            );
            const result = stmt.run(sessionId, sender, content);
            console.log(chalk.green('💾 Message saved successfully'));
            return result.lastInsertRowid;
        } catch (error) {
            console.error(chalk.red('❌ Error saving message:'), error);
            throw error;
        }
    }

    /**
     * Get all messages for a session
     */
    getSessionMessages(sessionId) {
        try {
            const stmt = this.db.prepare(
                'SELECT * FROM chats WHERE session_id = ? ORDER BY timestamp ASC'
            );
            const messages = stmt.all(sessionId);
            return messages;
        } catch (error) {
            console.error(chalk.red('❌ Error retrieving messages:'), error);
            throw error;
        }
    }

    /**
     * Clear a chat session
     */
    clearSession(sessionId) {
        try {
            const stmt = this.db.prepare('DELETE FROM chats WHERE session_id = ?');
            stmt.run(sessionId);
            console.log(chalk.yellow('🧹 Chat session cleared'));
        } catch (error) {
            console.error(chalk.red('❌ Error clearing session:'), error);
            throw error;
        }
    }

    /**
     * Get all chat sessions
     */
    getAllSessions() {
        try {
            const stmt = this.db.prepare(
                'SELECT DISTINCT session_id FROM chats ORDER BY timestamp DESC'
            );
            return stmt.all();
        } catch (error) {
            console.error(chalk.red('❌ Error retrieving sessions:'), error);
            throw error;
        }
    }
}

export default new ChatService();
