// /**
//  * @fileoverview Main application entry point
//  * Initializes the chat interface and handles user interactions
//  */

// import { initializeTheme, toggleTheme } from './services/themeService.js';
// import { saveMessage, getAllMessages } from './services/storageService.js';
// import { handleError } from './utils/errorHandler.js';

// // DOM Elements
// const chatMessages = document.getElementById('chat-messages');
// const chatInput = document.getElementById('chat-input');
// const sendButton = document.getElementById('send-button');
// const clearButton = document.getElementById('clear-chat');
// const deleteButton = document.getElementById('delete-all');
// const themeToggle = document.getElementById('theme-toggle');

// // Initialize theme
// initializeTheme();

// // Event Listeners
// document.addEventListener('DOMContentLoaded', () => {
//     // Theme toggle
//     themeToggle.addEventListener('click', toggleTheme);

//     // Send message on button click
//     sendButton.addEventListener('click', sendMessage);

//     // Send message on Enter key
//     chatInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') {
//             sendMessage();
//         }
//     });

//     // Clear chat (just clear UI for now)
//     clearButton.addEventListener('click', () => {
//         chatMessages.innerHTML = '';
//         localStorage.setItem('messages', '[]');
//     });

//     // Delete all (just clear UI for now)
//     deleteButton.addEventListener('click', () => {
//         chatMessages.innerHTML = '';
//         localStorage.setItem('messages', '[]');
//     });
// });

// /**
//  * Send a message to the chat
//  */
// async function sendMessage() {
//     if (!chatInput.value.trim()) return;

//     try {
//         // Display user message
//         displayMessage(chatInput.value, 'user');

//         // Show loading message
//         const loadingMessage = document.createElement('div');
//         loadingMessage.classList.add('message', 'bot-message', 'loading');
//         loadingMessage.textContent = 'Harper is typing...';
//         chatMessages.appendChild(loadingMessage);
//         chatMessages.scrollTop = chatMessages.scrollHeight;

//         // Get bot response
//         const response = await fetch('/api/chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ message: chatInput.value })
//         });

//         if (!response.ok) {
//             throw new Error('Failed to send message');
//         }

//         const data = await response.json();
        
//         // Save messages to localStorage
//         saveMessage({ sender: 'user', content: chatInput.value });
//         saveMessage({ sender: 'bot', content: data.message });

//         // Remove loading message
//         loadingMessage.remove();

//         // Display the bot's response
//         displayMessage(data.message, 'bot');

//         // Clear input
//         chatInput.value = '';

//     } catch (error) {
//         handleError(error, { showUser: true });
//     }
// }

// /**
//  * Display a message in the chat window
//  */
// function displayMessage(message, sender) {
//     const messageElement = document.createElement('div');
//     messageElement.classList.add('message', `${sender}-message`);
//     messageElement.textContent = message;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }


/**
 * @fileoverview Main application entry point
 * Initializes the chat interface and handles user interactions
 */

// Theme and Storage services
import { initializeTheme, toggleTheme } from './services/themeService.js';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-chat');
const deleteButton = document.getElementById('delete-all');
const themeToggle = document.getElementById('theme-toggle');

// Initialize theme
initializeTheme();

// Utility: Save message to localStorage
function saveMessage(message) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
}

// Utility: Retrieve all messages from localStorage
function getAllMessages() {
    return JSON.parse(localStorage.getItem('messages') || '[]');
}

// Load messages from localStorage on page load
function loadStoredMessages() {
    const messages = getAllMessages();
    messages.forEach((msg) => displayMessage(msg.content, msg.sender));
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
        localStorage.setItem('messages', '[]'); // Reset localStorage
    });

    // Delete all
    deleteButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        localStorage.setItem('messages', '[]'); // Reset localStorage
    });

    // Load saved messages
    loadStoredMessages();
});

/**
 * Send a message to the chat
 */
async function sendMessage() {
    if (!chatInput.value.trim()) return;

    try {
        // Display user message
        displayMessage(chatInput.value, 'user');

        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'bot-message', 'loading');
        loadingMessage.textContent = 'Harper is typing...';
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get bot response
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: chatInput.value })
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();

        // Save messages to localStorage
        saveMessage({ sender: 'user', content: chatInput.value });
        saveMessage({ sender: 'bot', content: data.message });

        // Remove loading message
        loadingMessage.remove();

        // Display bot's response
        displayMessage(data.message, 'bot');

        // Clear input
        chatInput.value = '';

    } catch (error) {
        console.error('Error:', error);
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

