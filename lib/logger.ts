/**
 * Centralized Logger
 *
 * Provides a unified logging interface that:
 * - Outputs logs in development mode
 * - Silences logs in production (except errors to Sentry when configured)
 * - Adds context prefixes for easier debugging
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *   logger.log('[UserStore]', 'User logged in', { userId });
 *   logger.error('[API]', 'Request failed', error);
 */

// Check if we're in development mode
// __DEV__ is a React Native global that's true in development
declare const __DEV__: boolean;

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  /** Enable all logs regardless of environment */
  forceEnable?: boolean;
  /** Minimum log level to output */
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

class Logger {
  private forceEnable: boolean;
  private minLevel: number;

  constructor(options: LoggerOptions = {}) {
    this.forceEnable = options.forceEnable ?? false;
    // Default to 'warn' level - only show warnings and errors
    // Set to 'debug' for verbose logging during development
    this.minLevel = LOG_LEVELS[options.minLevel ?? 'warn'];
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.forceEnable) return true;
    if (!isDev && level !== 'error') return false;
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatArgs(args: unknown[]): unknown[] {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    return [`[${timestamp}]`, ...args];
  }

  /**
   * General log output (development only)
   * Uses console.warn as it's allowed by ESLint config
   */
  log(...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.warn('[LOG]', ...this.formatArgs(args));
    }
  }

  /**
   * Informational messages (development only)
   * Uses console.warn as it's allowed by ESLint config
   */
  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.warn('[INFO]', ...this.formatArgs(args));
    }
  }

  /**
   * Warning messages (development only)
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...this.formatArgs(args));
    }
  }

  /**
   * Error messages (always logged, sent to Sentry in production)
   */
  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...this.formatArgs(args));
    }

    // In production, errors could be sent to Sentry
    // TODO: Add Sentry integration when Phase 6.1 is implemented
    // if (!isDev) {
    //   Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(String(args[0])));
    // }
  }

  /**
   * Debug messages (development only, lowest priority)
   * Uses console.warn as it's allowed by ESLint config
   */
  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.warn('[DEBUG]', ...this.formatArgs(args));
    }
  }

  /**
   * Create a child logger with a prefix
   */
  withPrefix(prefix: string): PrefixedLogger {
    return new PrefixedLogger(prefix, this);
  }
}

/**
 * Logger with a fixed prefix for module-specific logging
 */
class PrefixedLogger {
  constructor(
    private prefix: string,
    private parent: Logger
  ) {}

  log(...args: unknown[]): void {
    this.parent.log(this.prefix, ...args);
  }

  info(...args: unknown[]): void {
    this.parent.info(this.prefix, ...args);
  }

  warn(...args: unknown[]): void {
    this.parent.warn(this.prefix, ...args);
  }

  error(...args: unknown[]): void {
    this.parent.error(this.prefix, ...args);
  }

  debug(...args: unknown[]): void {
    this.parent.debug(this.prefix, ...args);
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export the class for custom configurations
export { Logger, PrefixedLogger };

// Convenience exports for module-specific loggers
export const createLogger = (prefix: string) => logger.withPrefix(prefix);
