# Gemini Flash Chat Application

## Project Overview

A modern chatbot application that leverages Google's technology to create an intelligent chat experience with a sleek interface and persistent storage capabilities.

## Core Features

### AI Integration

- Connection to Google's services
- Intelligent chat responses
- Bot personality: Harper
- Customized behavior instructions

### User Interface

- Modern, clean design
- Dark/Light mode toggle
- Profile image section (250x250px, rounded) in top-right corner
- Chat functionality:
  - Send message button
  - Clear chat button (clears localStorage)
  - Delete all button (for future database integration)

### Data Management

- Primary storage: localStorage
- Future integration: Lightweight database
- Chat session persistence

## Technical Requirements

### Frontend

- Vanilla JavaScript (ES6+)
- Clean, readable code structure
- Comprehensive code comments
- Potential Vite integration (if viable)

### Backend

- Express.js server
- Environment variable management
- API integration handling

## Development Workflow

### Phase 1: Setup & Basic Structure

1. [ ] Set up project structure
2. [ ] Configure environment variables
3. [ ] Implement basic Express server
4. [ ] Create initial HTML/CSS layout

### Phase 2: Core Functionality

1. [ ] Implement Google service integration
2. [ ] Set up chat interface
3. [ ] Add localStorage functionality
4. [ ] Create dark/light mode toggle

### Phase 3: Enhanced Features

1. [ ] Implement chat persistence
2. [ ] Add clear chat functionality
3. [ ] Style profile image section
4. [ ] Polish UI/UX

### Phase 4: Future Enhancements

1. [ ] Database integration
2. [ ] Delete all functionality
3. [ ] Additional UI improvements
4. [ ] Performance optimizations

## Code Architecture

### Modular Structure

- Each feature in its own module
- Clear separation of concerns
- Isolated functionality for easier debugging
- Export/import pattern for all modules

### Module Organization

- `/services`
  - `geminiService.js` - AI interaction handling
  - `storageService.js` - Data persistence logic
  - `themeService.js` - Dark/light mode management

- `/utils`
  - `errorHandler.js` - Centralized error handling
  - `logger.js` - Debugging and logging utilities
  - `validators.js` - Input validation helpers

- `/ui`
  - `chatUI.js` - Chat interface components
  - `themeUI.js` - Theme switching components
  - `imageUI.js` - Profile image handling

### Error Handling

- Try-catch blocks in all async operations
- Custom error types for different scenarios
- Detailed error logging for debugging
- User-friendly error messages

### Code Documentation

- JSDoc comments for all functions
- Example usage in comments
- Input/output type specifications
- Edge case documentation

### Testing Strategy

- Isolated module testing
- Error scenario testing
- UI interaction testing
- Storage functionality testing

## Code Standards

- Prioritize code readability over brevity
- Comment all code blocks thoroughly
- Follow ES6+ standards
- Maintain clear file structure
- Use meaningful variable and function names
- Keep functions small and focused (max 20 lines recommended)
- Add error handling for all external operations
- Include input validation for all user interactions
- Use constants for configuration values
- Implement proper type checking

## Notes

- Server will be managed manually by the developer
- Focus on beginner-friendly code structure
- Document all steps clearly for future reference
