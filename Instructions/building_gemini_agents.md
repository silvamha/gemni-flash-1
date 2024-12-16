# Building a Gemini Chat Agent: Step-by-Step Guide

## Prerequisites

1. Node.js installed
2. A Google Gemini API key
3. Basic JavaScript knowledge

## Step 1: Project Setup

```bash
# Create project structure
mkdir my-gemini-bot
cd my-gemini-bot
npm init -y

# Install dependencies
npm install express dotenv @google/generative-ai sqlite3 nodemon
```

Create this folder structure:

```
my-gemini-bot/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       └── main.js
├── services/
│   └── geminiService.js
├── database/
│   └── chatService.js
├── utils/
│   └── logger.js
├── .env
└── server.js
```

## Step 2: Environment Setup

Create `.env`:

```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

## Step 3: Create the Gemini Service

In `services/geminiService.js`:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import Logger from '../utils/logger.js';

export default class GeminiService {
    constructor(apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
        this.activeChats = new Map();
    }

    async getOrCreateChat(sessionId) {
        if (this.activeChats.has(sessionId)) {
            return this.activeChats.get(sessionId);
        }

        const chat = this.model.startChat({
            history: []
        });
        
        this.activeChats.set(sessionId, chat);
        return chat;
    }

    async sendMessage(message, sessionId) {
        try {
            Logger.system('Sending message to Gemini...');
            const chat = await this.getOrCreateChat(sessionId);
            
            // Format message to maintain bot's identity
            const formattedMessage = `USER: ${message}\nBOT (remember your personality):`;
            
            const result = await chat.sendMessage([{ text: formattedMessage }]);
            const response = await result.response;
            
            Logger.system('Received response from Gemini');
            return response.text();
        } catch (error) {
            Logger.error('Error in sendMessage: ' + error.message);
            throw error;
        }
    }
}
```

## Step 4: Create the Chat Service

In `database/chatService.js`:

```javascript
import sqlite3 from 'sqlite3';
import Logger from '../utils/logger.js';

class ChatService {
    constructor() {
        this.db = new sqlite3.Database('./chat.db', (err) => {
            if (err) {
                Logger.error('Database connection failed: ' + err.message);
            } else {
                Logger.system('Connected to database');
                this.initDatabase();
            }
        });
    }

    initDatabase() {
        const sql = `
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                sender TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        this.db.run(sql);
    }

    saveMessage(sessionId, sender, content) {
        const sql = 'INSERT INTO messages (session_id, sender, content) VALUES (?, ?, ?)';
        this.db.run(sql, [sessionId, sender, content]);
    }

    getSessionMessages(sessionId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC';
            this.db.all(sql, [sessionId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default new ChatService();
```

## Step 5: Create the Server

In `server.js`:

```javascript
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GeminiService from './services/geminiService.js';
import chatService from './database/chatService.js';
import Logger from './utils/logger.js';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let geminiService;
try {
    geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    Logger.system('Gemini service initialized successfully');
} catch (error) {
    Logger.error('Failed to initialize Gemini service: ' + error.message);
    process.exit(1);
}

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || Date.now().toString();
    
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        chatService.saveMessage(sessionId, 'user', message);
        const text = await geminiService.sendMessage(message, sessionId);
        chatService.saveMessage(sessionId, 'bot', text);

        res.json({ 
            message: text,
            timestamp: new Date().toISOString(),
            sessionId
        });
    } catch (error) {
        Logger.error('Chat error: ' + error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chat/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await chatService.getSessionMessages(sessionId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get chat history' });
    }
});

app.listen(PORT, () => {
    Logger.system(`Server running on http://localhost:${PORT}`);
});
```

## Step 6: Create the Frontend

In `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Bot</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="chat-container">
        <div id="chat-messages"></div>
        <div class="input-container">
            <input type="text" id="chat-input" placeholder="Type a message...">
            <button id="send-button">Send</button>
        </div>
    </div>
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

In `public/js/main.js`:

```javascript
// Generate a session ID and store it
if (!localStorage.getItem('session_id')) {
    localStorage.setItem('session_id', Date.now().toString());
}

const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

async function loadStoredMessages() {
    try {
        const sessionId = localStorage.getItem('session_id');
        const response = await fetch(`/api/chat/${sessionId}`);
        const messages = await response.json();
        
        messages.forEach(msg => {
            displayMessage(msg.content, msg.sender);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    chatInput.value = '';
    displayMessage(message, 'user');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': localStorage.getItem('session_id')
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Failed to send message');
        
        const data = await response.json();
        displayMessage(data.message, 'bot');
    } catch (error) {
        console.error('Error:', error);
        displayMessage('Sorry, something went wrong!', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadStoredMessages);
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
```

In `public/styles.css`:

```css
body {
    margin: 0;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.chat-container {
    max-width: 800px;
    margin: 0 auto;
    border: 1px solid #ccc;
    border-radius: 5px;
}

#chat-messages {
    height: 500px;
    overflow-y: auto;
    padding: 20px;
}

.message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
    max-width: 70%;
}

.user-message {
    background-color: #007bff;
    color: white;
    margin-left: auto;
}

.bot-message {
    background-color: #e9ecef;
    color: black;
}

.input-container {
    display: flex;
    padding: 20px;
    border-top: 1px solid #ccc;
}

#chat-input {
    flex: 1;
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

#send-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

#send-button:hover {
    background-color: #0056b3;
}
```

## Step 7: Create the Logger

In `utils/logger.js`:

```javascript
class Logger {
    static system(message) {
        console.log('[SYSTEM]', message);
    }

    static error(message) {
        console.error('[ERROR]', message);
    }

    static chat(sender, message) {
        console.log(`[${sender.toUpperCase()}]`, message);
    }
}

export default Logger;
```

## Step 8: Run the Bot

1. Add to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

2. Start the server:

```bash
npm run dev
```

3. Visit `http://localhost:3000`

## Key Points to Remember

1. **Memory Works Through**:
   - Persistent chat sessions in `activeChats` Map
   - Database storage of messages
   - LocalStorage for session ID

2. **Identity Maintained By**:
   - Simple message formatting: `USER: message\nBOT (remember your personality):`
   - Not modifying any safety settings
   - Letting Gemini handle the context

3. **Safety Considerations**:
   - Never modify Gemini's default safety settings
   - Keep message formatting simple
   - Don't try to manipulate the chat history manually

## Troubleshooting

1. If messages aren't saving: Check database connection
2. If bot loses identity: Check message formatting in `geminiService.js`
3. If memory isn't working: Verify session ID is being passed correctly

## Next Steps

1. Add bot personality customization
2. Implement error retry logic
3. Add message timestamps
4. Enhance UI with typing indicators
5. Add message delivery status
