/**
 * Logger Utility
 * Provides structured logging for development and production environments
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
let logsDir;
try {
  logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create logs directory:', err.message);
  logsDir = null;
}

class Logger {
  constructor(module) {
    this.module = module;
    this.isDev = process.env.NODE_ENV === 'development';
  }

  _formatMessage(level, message, data) {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      ...(data && { data }),
    };
  }

  _writeLog(logEntry) {
    if (!logsDir) return;
    
    try {
      const logPath = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(logPath, logLine);
    } catch (err) {
      console.warn('Could not write log:', err.message);
    }
  }

  info(message, data) {
    const logEntry = this._formatMessage('INFO', message, data);
    console.log(`[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.module}] ${message}`, data || '');
    this._writeLog(logEntry);
  }

  error(message, error, data) {
    const logEntry = this._formatMessage('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...data,
    });
    console.error(`[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.module}] ${message}`, logEntry.data);
    this._writeLog(logEntry);
  }

  warn(message, data) {
    const logEntry = this._formatMessage('WARN', message, data);
    console.warn(`[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.module}] ${message}`, data || '');
    this._writeLog(logEntry);
  }

  debug(message, data) {
    if (this.isDev) {
      const logEntry = this._formatMessage('DEBUG', message, data);
      console.debug(`[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.module}] ${message}`, data || '');
      this._writeLog(logEntry);
    }
  }
}

module.exports = Logger;
