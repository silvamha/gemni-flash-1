/**
 * @fileoverview Express Server - Handles environment variables and Google API connection
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GeminiService from './services/geminiService.js';
import chatService from './database/chatService.js';
import Logger from './utils/logger.js';

// Initialize environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize services
let geminiService;
try {
    geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    Logger.system('Gemini service initialized successfully');
} catch (error) {
    Logger.error('Failed to initialize Gemini service: ' + error.message);
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

/**
 * Serve static files from our public directory
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    Logger.system('New client connected');
});

/**
 * Chat API endpoint
 */
app.post('/api/chat', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || Date.now().toString();
    
    try {
        const { message } = req.body;
        if (!message) {
            Logger.error('Empty message received');
            return res.status(400).json({ error: 'Message is required' });
        }

        // Log and save user message
        Logger.chat('user', message);
        chatService.saveMessage(sessionId, 'user', message);

        Logger.system('Sending message to Gemini...');
        
        // Get response from Gemini
        const text = await geminiService.sendMessage(message);

        // Log and save bot response
        Logger.chat('bot', text);
        chatService.saveMessage(sessionId, 'bot', text);

        res.json({ 
            message: text,
            timestamp: new Date().toISOString(),
            sessionId
        });
    } catch (error) {
        Logger.error('Chat error: ' + error.message);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Get chat history for a session
 */
app.get('/api/chat/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = chatService.getSessionMessages(sessionId);
        Logger.system(`Retrieved chat history for session ${sessionId}`);
        res.json(messages);
    } catch (error) {
        Logger.error('History error: ' + error.message);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
});

// Start server
app.listen(PORT, () => {
    Logger.system(`Server running on http://localhost:${PORT}`);
    Logger.system('Environment variables loaded');
});
