import Logger from '../utils/logger.js';

class MemoryService {
    async getRecentContext(sessionId, count) {
        try {
            // For now, just return an empty array to avoid breaking anything
            return [];
        } catch (error) {
            Logger.error('Error getting recent context: ' + error.message);
            return [];
        }
    }
}

export default new MemoryService();