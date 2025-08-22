import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: { 
    service: 'ai-core',
    version: process.env.AI_CORE_VERSION || '1.0.0'
  },
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, metadata }) => {
          const meta = metadata && Object.keys(metadata).length > 0 
            ? ` ${JSON.stringify(metadata)}` 
            : '';
          return `${timestamp} [${level}]: ${message}${meta}`;
        })
      ),
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/ai-core-error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/ai-core.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/ai-core-exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/ai-core-rejections.log' }),
  ],
});

// Create audit logger for AI actions
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ai-core-audit',
    version: process.env.AI_CORE_VERSION || '1.0.0'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/ai-core-audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Performance logger for metrics
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ai-core-performance',
    version: process.env.AI_CORE_VERSION || '1.0.0'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/ai-core-performance.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Security logger for security events
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ai-core-security',
    version: process.env.AI_CORE_VERSION || '1.0.0'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/ai-core-security.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    // Also log to console for immediate visibility
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, metadata }) => {
          const meta = metadata && Object.keys(metadata).length > 0 
            ? ` ${JSON.stringify(metadata)}` 
            : '';
          return `🔐 ${timestamp} [${level}]: ${message}${meta}`;
        })
      ),
    }),
  ],
});

export default logger;