/**
 * @fileoverview Custom logger for the application
 */

import chalk from 'chalk';

class Logger {
    static system(message) {
        console.log(chalk.blue(`[SYSTEM] ${message}`));
    }

    static error(message) {
        console.error(chalk.red(`[ERROR] ${message}`));
    }

    static chat(sender, message) {
        const color = sender === 'user' ? chalk.green : chalk.magenta;
        console.log(color(`[${sender.toUpperCase()}] ${message}`));
    }
}

export default Logger;
