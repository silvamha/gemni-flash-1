/**
 * @fileoverview Utility script to view chat database contents
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'chats.db');

// Connect to database
const db = new Database(dbPath);

// Get all chat sessions
const sessions = db.prepare('SELECT DISTINCT session_id FROM chats ORDER BY timestamp DESC').all();

console.log(chalk.blue('\n📱 Chat Sessions:\n'));

sessions.forEach(session => {
    console.log(chalk.yellow(`\nSession ID: ${session.session_id}`));
    console.log(chalk.gray('----------------------------------------'));

    // Get messages for this session
    const messages = db.prepare(`
        SELECT sender, content, timestamp 
        FROM chats 
        WHERE session_id = ? 
        ORDER BY timestamp ASC
    `).all(session.session_id);

    messages.forEach(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.sender === 'user' ? chalk.green('User') : chalk.blue('Harper');
        console.log(`${chalk.gray(timestamp)} ${sender}:`);
        console.log(`${msg.content}\n`);
    });
});

// Print summary
console.log(chalk.blue('\n📊 Summary:'));
console.log(chalk.white(`Total Sessions: ${sessions.length}`));
const totalMessages = db.prepare('SELECT COUNT(*) as count FROM chats').get().count;
console.log(chalk.white(`Total Messages: ${totalMessages}\n`));

// Close database connection
db.close();
