/**
 * @fileoverview Theme Service - Manages application theme (dark/light mode)
 */

const THEME_KEY = 'app_theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

/**
 * Initializes theme based on user's saved preference or system preference
 * @returns {Promise<string>} The current theme
 */
export const initializeTheme = async () => {
    try {
        let theme = localStorage.getItem(THEME_KEY);
        
        if (!theme) {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? THEMES.DARK : THEMES.LIGHT;
            await setTheme(theme);
        }
        
        return theme;
    } catch (error) {
        console.error('Error initializing theme:', error);
        return THEMES.LIGHT; // Default to light theme on error
    }
};

/**
 * Sets the application theme
 * @param {string} theme - Either 'light' or 'dark'
 * @throws {Error} If theme is invalid
 * @returns {Promise<void>}
 */
export const setTheme = async (theme) => {
    try {
        if (!Object.values(THEMES).includes(theme)) {
            throw new Error('Invalid theme');
        }

        localStorage.setItem(THEME_KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
        console.error('Error setting theme:', error);
        throw error;
    }
};

/**
 * Toggles between light and dark themes
 * @returns {Promise<string>} The new theme
 */
export const toggleTheme = async () => {
    const currentTheme = localStorage.getItem(THEME_KEY) || THEMES.LIGHT;
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    await setTheme(newTheme);
    return newTheme;
};
