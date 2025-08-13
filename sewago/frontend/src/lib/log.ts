export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(level: LogLevel, message: string, context: LogContext = {}, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const { timestamp, level, message, context, error } = entry;
    const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';

    if (this.isDevelopment) {
      // Development: Pretty console output
      const colors = {
        debug: 'color: #6B7280',
        info: 'color: #3B82F6',
        warn: 'color: #F59E0B',
        error: 'color: #EF4444',
      };

      console.group(
        `%c[${level.toUpperCase()}] ${timestamp}`,
        colors[level]
      );
      console.log(message);
      if (Object.keys(context).length > 0) {
        console.table(context);
      }
      if (error) {
        console.error(error);
      }
      console.groupEnd();
    } else {
      // Production: Structured JSON logging
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context: LogContext = {}): void {
    this.output(this.formatLog('debug', message, context));
  }

  info(message: string, context: LogContext = {}): void {
    this.output(this.formatLog('info', message, context));
  }

  warn(message: string, context: LogContext = {}): void {
    this.output(this.formatLog('warn', message, context));
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    this.output(this.formatLog('error', message, context, error));
  }

  // Request-specific logging
  requestLog(requestId: string, message: string, context: LogContext = {}): void {
    this.info(message, { ...context, requestId });
  }

  // User action logging
  userAction(userId: string, action: string, resource: string, context: LogContext = {}): void {
    this.info(`User action: ${action} on ${resource}`, { ...context, userId, action, resource });
  }

  // API request logging
  apiRequest(method: string, path: string, statusCode: number, duration: number, context: LogContext = {}): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `API ${method} ${path} - ${statusCode} (${duration}ms)`;
    
    this[level](message, { ...context, method, path, statusCode, duration });
  }

  // Database operation logging
  dbOperation(operation: string, collection: string, duration: number, context: LogContext = {}): void {
    this.debug(`DB ${operation} on ${collection} (${duration}ms)`, { ...context, operation, collection, duration });
  }

  // Performance logging
  performance(operation: string, duration: number, context: LogContext = {}): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, { ...context, operation, duration });
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`, { ...context, operation, duration });
    }
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Utility functions for common logging patterns
export function logRequest(requestId: string, message: string, context: LogContext = {}) {
  logger.requestLog(requestId, message, context);
}

export function logUserAction(userId: string, action: string, resource: string, context: LogContext = {}) {
  logger.userAction(userId, action, resource, context);
}

export function logApiRequest(method: string, path: string, statusCode: number, duration: number, context: LogContext = {}) {
  logger.apiRequest(method, path, statusCode, duration, context);
}

export function logDbOperation(operation: string, collection: string, duration: number, context: LogContext = {}) {
  logger.dbOperation(operation, collection, duration, context);
}

export function logPerformance(operation: string, duration: number, context: LogContext = {}) {
  logger.performance(operation, duration, context);
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Performance measurement utility
export function measurePerformance<T>(operation: string, fn: () => T | Promise<T>, context: LogContext = {}): T | Promise<T> {
  const start = performance.now();
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        logPerformance(operation, duration, context);
      });
    } else {
      const duration = performance.now() - start;
      logPerformance(operation, duration, context);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - start;
    logPerformance(operation, duration, { ...context, error: error as Error });
    throw error;
  }
}

// Async performance measurement
export async function measureAsyncPerformance<T>(
  operation: string, 
  fn: () => Promise<T>, 
  context: LogContext = {}
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logPerformance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logPerformance(operation, duration, { ...context, error: error as Error });
    throw error;
  }
}

// Export logger instance as default
export default logger;
