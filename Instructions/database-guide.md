# Database Access Guide

## Overview
Our chat application uses SQLite3 for data storage, with the database file located at `database/chats.db`. The database contains a single table called `chats` that stores all message history.

## Database Schema

### Chats Table
```sql
CREATE TABLE chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Basic Operations

### 1. Initialize Database
To create or reset the database:
```bash
npm run init-db
```
This will create the database file and necessary tables if they don't exist.

### 2. View All Chats
To see all stored chat messages:
```bash
npm run view-chats
```

## Using ChatService in Code

### Import the Service
```javascript
import chatService from '../database/chatService.js';
```

### Available Methods

#### 1. Save a Message
```javascript
// Save a new message
const result = await chatService.saveMessage(
    'session123',  // session ID
    'user',        // sender (either 'user' or 'bot')
    'Hello!'      // message content
);
```

#### 2. Get Session Messages
```javascript
// Get all messages from a specific session
const messages = await chatService.getSessionMessages('session123');
```

#### 3. Clear a Session
```javascript
// Delete all messages in a session
await chatService.clearSession('session123');
```

#### 4. Get All Sessions
```javascript
// Get a list of all chat sessions
const sessions = await chatService.getAllSessions();
```

## Example Usage

```javascript
// Example: Complete chat interaction
async function handleChat() {
    try {
        // Save user message
        await chatService.saveMessage(
            'session123',
            'user',
            'Hi Harper!'
        );

        // Save bot response
        await chatService.saveMessage(
            'session123',
            'bot',
            'Hello! How can I help you today?'
        );

        // Get conversation history
        const messages = await chatService.getSessionMessages('session123');
        console.log('Chat history:', messages);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Database Location
- File path: `database/chats.db`
- Each session creates a unique conversation thread
- Messages are automatically timestamped
- Messages are stored persistently and survive server restarts

## Error Handling
All methods include built-in error handling and will:
1. Log errors to the console with descriptive messages
2. Throw errors that can be caught in try/catch blocks
3. Use color-coded console messages for better visibility

## Best Practices
1. Always use try/catch blocks when interacting with the database
2. Use meaningful session IDs for better organization
3. Check returned messages to ensure operations completed successfully
4. Use the built-in timestamp for message ordering

## Troubleshooting

### Common Issues:
1. **Database Locked**: If you get a "database is locked" error, ensure you're not trying to write to the database from multiple processes simultaneously.

2. **File Not Found**: If the database file isn't found, run `npm run init-db` to create it.

3. **Permission Issues**: Ensure your application has write permissions in the database directory.

### Quick Fixes:
1. Restart the server to clear any hanging connections
2. Run `npm run init-db` to reset the database
3. Check console logs for detailed error messages

Need more help? The source code for database operations is in:
- `database/init.js` - Database initialization
- `database/chatService.js` - Main database service
- `database/viewChats.js` - Utility for viewing chats
