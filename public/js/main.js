/**
 * @fileoverview Main application entry point
 * Initializes the chat interface and handles user interactions
 */

import { initializeTheme, toggleTheme } from './services/themeService.js';
import { saveMessage, getAllMessages, clearAllMessages } from './services/storageService.js';
import { handleError } from './utils/errorHandler.js';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-chat');
const deleteButton = document.getElementById('delete-all');
const themeToggle = document.getElementById('theme-toggle');

// Initialize theme and session
initializeTheme();
const sessionId = localStorage.getItem('session_id') || Date.now().toString();
localStorage.setItem('session_id', sessionId);

// Load messages from localStorage on page load
function loadStoredMessages() {
    try {
        const messages = getAllMessages();
        messages.forEach(msg => {
            displayMessage(msg.content, msg.sender);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Clear chat
    clearButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        clearAllMessages();
    });

    // Delete all
    deleteButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        clearAllMessages();
        // Generate new session on delete all
        localStorage.setItem('session_id', Date.now().toString());
    });

    // Load stored messages
    loadStoredMessages();
});

/**
 * Send a message to the chat
 */
async function sendMessage() {
    if (!chatInput.value.trim()) return;

    try {
        const userMessage = {
            content: chatInput.value,
            sender: 'user'
        };

        // Display and save user message
        displayMessage(userMessage.content, userMessage.sender);
        saveMessage(userMessage);

        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'bot-message', 'loading');
        loadingMessage.textContent = 'Harper is typing...';
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get bot response
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': localStorage.getItem('session_id')
            },
            body: JSON.stringify({ message: chatInput.value })
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        
        const botMessage = {
            content: data.message,
            sender: 'bot'
        };

        // Save and display bot message
        saveMessage(botMessage);

        // Remove loading message
        loadingMessage.remove();

        // Display bot's response
        displayMessage(botMessage.content, botMessage.sender);

        // Clear input
        chatInput.value = '';

    } catch (error) {
        handleError(error, { showUser: true });
    }
}

/**
 * Display a message in the chat window
 */
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
