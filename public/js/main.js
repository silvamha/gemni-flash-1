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

/**
 * Initialize the application
 */
const init = async () => {
    try {
        // Set initial theme
        await initializeTheme();

        // Load existing messages
        const messages = await getAllMessages();
        messages.forEach(message => displayMessage(message));

        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        handleError(error);
    }
};

/**
 * Set up event listeners for all interactive elements
 */
const setupEventListeners = () => {
    // Send message on button click or Enter key
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Theme toggle
    themeToggle.addEventListener('click', async () => {
        try {
            await toggleTheme();
        } catch (error) {
            handleError(error);
        }
    });

    // Clear chat (localStorage)
    clearButton.addEventListener('click', async () => {
        try {
            await clearAllMessages();
            chatMessages.innerHTML = '';
        } catch (error) {
            handleError(error);
        }
    });

    // Delete all (future database implementation)
    deleteButton.addEventListener('click', () => {
        alert('Database deletion will be implemented in a future phase');
    });
};

/**
 * Send a message to the chat
 */
const sendMessage = async () => {
    try {
        const content = chatInput.value.trim();
        if (!content) return;

        // Create message object
        const message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        // Save and display user message
        await saveMessage(message);
        displayMessage(message);

        // Clear input
        chatInput.value = '';

        // Show loading indicator
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'bot-message', 'loading');
        loadingMessage.textContent = 'Harper is typing...';
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get bot response
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: content })
        });

        // Remove loading indicator
        loadingMessage.remove();

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || responseData.details || 'Failed to get response from Harper');
        }

        if (responseData.error) {
            throw new Error(responseData.error);
        }

        const botMessage = {
            id: Date.now().toString(),
            content: responseData.message,
            sender: 'bot',
            timestamp: responseData.timestamp
        };

        // Save and display bot message
        await saveMessage(botMessage);
        displayMessage(botMessage);
    } catch (error) {
        handleError(error, { showUser: true });
    }
};

/**
 * Display a message in the chat window
 * @param {Object} message - The message to display
 */
const displayMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${message.sender}-message`);
    messageElement.textContent = message.content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Initialize the application
init();
