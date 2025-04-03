/**
 * Simple logger utility for consistent logging across the application
 * This specific implementation only shows logs in console
 * In production, you might want to use a more sophisticated logging library
 * or service (e.g., Winston, Pino, etc.)
 * This logger can be extended to include different transports (e.g., file, HTTP)
 * and formats (e.g., JSON, plain text) as needed.
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
