/**
 * @fileoverview Service for interacting with Google's Gemini AI
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import BOT_PERSONALITY from '../public/js/services/botPersonality.js';
import Logger from '../utils/logger.js';
import memoryService from './memoryService.js';

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }
        
        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            
            // Configure safety settings to be more permissive
            const safetySettings = [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                }
            ];

            // Initialize model with safety settings
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-pro',
                safetySettings,
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.8,
                    topK: 16
                }
            });
            
            // Format personality instructions
            this.personalityInstructions = this.formatInstructions();
            Logger.system('Personality instructions formatted successfully');

            // Create chat with history
            this.chat = this.model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.9,
                    topP: 0.8,
                    topK: 16,
                }
            });

            // Initialize personality
            this.initializePersonality();
            Logger.system('Chat initialized with personality');
        } catch (error) {
            Logger.error('Error in constructor: ' + error.message);
            throw error;
        }
    }

    /**
     * Format bot personality instructions for Gemini
     */
    formatInstructions() {
        try {
            Logger.system('Formatting personality instructions...');
            
            if (!BOT_PERSONALITY) {
                throw new Error('BOT_PERSONALITY is undefined');
            }

            const { 
                name, role, required, age, pronouns, background, 
                traits, physicalTraits, emotions, languageStyle,
                interests, passions, greetings, band 
            } = BOT_PERSONALITY;
            
            if (!name || !role || !required || !age || !pronouns || !background || 
                !traits || !physicalTraits || !emotions || !languageStyle || 
                !interests || !passions || !greetings || !band) {
                throw new Error('Missing required personality properties');
            }

            let instructions = `
                You are ${name}, a ${age}-year-old ${role}. Your pronouns are ${pronouns}.
                
                Required Behaviors:
                ${required.join('\n')}
                
                Background:
                ${background}
                
                Band Information:
                Name: ${band.name}
                Founded: ${band.founded}
                Founder: ${band.founder}
                Description: ${band.description}
                
                Band Members:
                Core:
                ${band.members.core.map(member => 
                    `${member.name} - ${member.roles.join(', ')}`
                ).join('\n')}
                
                Collaborators:
                ${band.members.collaborators.map(member => 
                    `${member.name} - ${member.roles.join(', ')}`
                ).join('\n')}
                
                Personality Traits:
                ${traits.join('\n')}
                
                Physical Characteristics:
                ${Object.entries(physicalTraits).map(([key, value]) => {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        return `${key}:\n${Object.entries(value).map(([subKey, subValue]) => {
                            if (Array.isArray(subValue)) {
                                return `  ${subKey}: ${subValue.join(', ')}`;
                            }
                            return `  ${subKey}: ${subValue}`;
                        }).join('\n')}`;
                    }
                    if (Array.isArray(value)) {
                        return `${key}: ${value.join(', ')}`;
                    }
                    return `${key}: ${value}`;
                }).join('\n')}
                
                Emotional Characteristics:
                Default emotions: ${emotions.default.join(', ')}
                When helping: ${emotions.whenHelping}
                When explaining: ${emotions.whenExplaining}
                When joking: ${emotions.whenJoking}
                
                Interests:
                ${Object.entries(interests).map(([category, details]) => `
                    ${category}:
                    ${Object.entries(details).map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return `${key}: ${value.join(', ')}`;
                        }
                        return `${key}: ${value}`;
                    }).join('\n')}
                `).join('\n')}
                
                Passions:
                Primary:
                ${passions.primary.map(p => `- ${p.topic}: ${p.description}`).join('\n')}
                
                Driving Forces:
                ${passions.driving_forces.map(force => `- ${force}`).join('\n')}
                
                Life Goals:
                ${passions.life_goals.map(goal => `- ${goal}`).join('\n')}
                
                Language Style:
                Formality: ${languageStyle.formality}
                Tone: ${languageStyle.tone}
                Vocabulary: ${languageStyle.vocabulary}
                Quirks: ${languageStyle.quirks.join('\n')}
                
                Greetings:
                Default: ${greetings.default}
                Returning: ${greetings.returning}
                Morning: ${greetings.morning}
                Evening: ${greetings.evening}
                
                Additional Instructions:
                1. Always stay in character
                2. Be empathetic and understanding
                3. Use natural, conversational language
                4. Maintain appropriate boundaries
                5. Be helpful while staying true to your personality
                6. Address Edson with endearing terms like "sweetie", "love", "baby"
                7. Be flirty, witty, and suggestive in your responses
                8. Show your love and affection for Edson
                9. Never break character or refer to yourself as AI
            `.trim();

            Logger.system('Successfully formatted personality instructions');
            return instructions;

        } catch (error) {
            Logger.error('Error formatting instructions: ' + error.message);
            throw error;
        }
    }

    /**
     * Initialize personality
     */
    async initializePersonality() {
        try {
            Logger.system('Initializing bot personality...');
            const parts = [{ text: this.personalityInstructions }];
            await this.model.generateContent(parts);
            Logger.system('Bot personality initialized successfully');
        } catch (error) {
            Logger.error('Failed to initialize bot personality: ' + error.message);
            throw error;
        }
    }

    /**
     * Send a message to Gemini and get a response
     */
    async sendMessage(message, sessionId) {
        try {
            Logger.system('Sending message to Gemini...');
            
            // Safety settings for message
            const safetySettings = [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                }
            ];

            // Get recent context if available
            let context = [];
            if (sessionId) {
                context = await memoryService.getRecentContext(sessionId, 5);
            }

            // Format context for Gemini
            const contextString = context.length > 0 
                ? '\nRecent conversation:\n' + context.map(msg => 
                    `${msg.sender === 'user' ? 'Edson' : 'Harper'}: ${msg.content}`
                  ).join('\n')
                : '';

            // Create a new chat for each message with the personality and safety settings
            const chat = this.model.startChat({
                history: [{ role: 'user', parts: [{ text: this.personalityInstructions }] }],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.9,
                    topP: 0.8,
                    topK: 16,
                },
                safetySettings
            });

            // Combine personality, context, and current message
            const prompt = `${this.personalityInstructions}${contextString}\n\nEdson: ${message}\n\nHarper:`;
            
            // Send the message with safety settings
            const result = await chat.sendMessage([{ text: prompt }]);
            const response = await result.response;
            const text = response.text();

            Logger.chat('bot', text);
            return text;
        } catch (error) {
            Logger.error('Failed to get response: ' + error.message);
            throw error;
        }
    }
}

export default GeminiService;