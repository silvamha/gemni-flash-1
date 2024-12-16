/**
 * @fileoverview Database initialization script
 * Creates the SQLite database and required tables
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const dbPath = path.join(__dirname, 'chats.db');
const db = new Database(dbPath);

console.log(chalk.blue('📦 Initializing database...'));

// Create chats table
db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log(chalk.green('✅ Database initialized successfully!'));
console.log(chalk.gray(`📁 Database location: ${dbPath}`));

// Close database connection
db.close();
