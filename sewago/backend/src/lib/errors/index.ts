// Custom error classes for consistent error handling
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', errorCode: string = 'AUTH_FAILED') {
    super(message, 401, errorCode);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', errorCode: string = 'ACCESS_DENIED') {
    super(message, 403, errorCode);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token expired', errorCode: string = 'TOKEN_EXPIRED') {
    super(message, 401, errorCode);
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    fieldErrors: Record<string, string[]> = {},
    errorCode: string = 'VALIDATION_FAILED'
  ) {
    super(message, 400, errorCode);
    this.fieldErrors = fieldErrors;
  }
}

export class RequiredFieldError extends AppError {
  constructor(field: string, errorCode: string = 'REQUIRED_FIELD') {
    super(`Field '${field}' is required`, 400, errorCode);
  }
}

export class InvalidFormatError extends AppError {
  constructor(field: string, format: string, errorCode: string = 'INVALID_FORMAT') {
    super(`Field '${field}' must be in format: ${format}`, 400, errorCode);
  }
}

// Resource errors
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, errorCode: string = 'NOT_FOUND') {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, errorCode);
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string, value: string, errorCode: string = 'DUPLICATE') {
    super(`${resource} with ${field} '${value}' already exists`, 409, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

// Business logic errors
export class InsufficientFundsError extends AppError {
  constructor(required: number, available: number, errorCode: string = 'INSUFFICIENT_FUNDS') {
    super(`Insufficient funds. Required: ${required}, Available: ${available}`, 400, errorCode);
  }
}

export class BookingConflictError extends AppError {
  constructor(message: string, errorCode: string = 'BOOKING_CONFLICT') {
    super(message, 409, errorCode);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, errorCode: string = 'SERVICE_UNAVAILABLE') {
    super(message, 503, errorCode);
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message: string, errorCode: string = 'DATABASE_ERROR') {
    super(message, 500, errorCode);
  }
}

export class ConnectionError extends AppError {
  constructor(message: string, errorCode: string = 'CONNECTION_ERROR') {
    super(message, 503, errorCode);
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(
    service: string,
    message: string,
    originalError?: Error,
    errorCode: string = 'EXTERNAL_SERVICE_ERROR'
  ) {
    super(message, 502, errorCode);
    this.service = service;
    this.originalError = originalError;
  }
}

export class PaymentGatewayError extends AppError {
  public readonly gateway: string;
  public readonly transactionId?: string;

  constructor(
    gateway: string,
    message: string,
    transactionId?: string,
    errorCode: string = 'PAYMENT_GATEWAY_ERROR'
  ) {
    super(message, 502, errorCode);
    this.gateway = gateway;
    this.transactionId = transactionId;
  }
}

// Rate limiting errors
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter: number = 60, errorCode: string = 'RATE_LIMIT') {
    super(message, 429, errorCode);
    this.retryAfter = retryAfter;
  }
}

// Error codes mapping
export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_FAILED: 'AUTH_FAILED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Business Logic
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  INVALID_STATUS: 'INVALID_STATUS',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  QUERY_TIMEOUT: 'QUERY_TIMEOUT',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT: 'RATE_LIMIT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  OVERLOADED: 'OVERLOADED'
} as const;

// Error messages mapping
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_FAILED]: 'Authentication failed. Please log in again.',
  [ERROR_CODES.ACCESS_DENIED]: 'You do not have permission to perform this action.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Your account has been locked due to multiple failed attempts.',
  
  [ERROR_CODES.VALIDATION_FAILED]: 'Please check your input and try again.',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format for this field.',
  [ERROR_CODES.INVALID_VALUE]: 'Invalid value for this field.',
  [ERROR_CODES.FIELD_TOO_LONG]: 'This field is too long.',
  [ERROR_CODES.FIELD_TOO_SHORT]: 'This field is too short.',
  
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.DUPLICATE]: 'This resource already exists.',
  [ERROR_CODES.CONFLICT]: 'This operation conflicts with current state.',
  [ERROR_CODES.ALREADY_EXISTS]: 'This resource already exists.',
  
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds to complete this transaction.',
  [ERROR_CODES.BOOKING_CONFLICT]: 'This time slot is not available.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'This service is currently unavailable.',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: 'This operation is not allowed in the current state.',
  [ERROR_CODES.INVALID_STATUS]: 'Invalid status for this operation.',
  
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the database.',
  [ERROR_CODES.QUERY_TIMEOUT]: 'Database query timed out.',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Database transaction failed.',
  
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service is currently unavailable.',
  [ERROR_CODES.PAYMENT_GATEWAY_ERROR]: 'Payment gateway error. Please try again.',
  [ERROR_CODES.SMS_SERVICE_ERROR]: 'SMS service is currently unavailable.',
  [ERROR_CODES.EMAIL_SERVICE_ERROR]: 'Email service is currently unavailable.',
  
  [ERROR_CODES.RATE_LIMIT]: 'Too many requests. Please try again later.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Rate limit exceeded. Please try again later.',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
  [ERROR_CODES.MAINTENANCE_MODE]: 'System is under maintenance. Please try again later.',
  [ERROR_CODES.OVERLOADED]: 'System is currently overloaded. Please try again later.'
} as const;

// Error factory function
export function createError(
  errorCode: keyof typeof ERROR_CODES,
  message?: string,
  statusCode?: number,
  details?: any
): AppError {
  const defaultMessage = ERROR_MESSAGES[errorCode] || 'An error occurred';
  const finalMessage = message || defaultMessage;
  
  let error: AppError;
  
  switch (errorCode) {
    case ERROR_CODES.AUTH_FAILED:
    case ERROR_CODES.TOKEN_EXPIRED:
      error = new AuthenticationError(finalMessage, errorCode);
      break;
    case ERROR_CODES.ACCESS_DENIED:
      error = new AuthorizationError(finalMessage, errorCode);
      break;
    case ERROR_CODES.VALIDATION_FAILED:
      error = new ValidationError(finalMessage, details?.fieldErrors);
      break;
    case ERROR_CODES.NOT_FOUND:
      error = new NotFoundError(details?.resource, details?.id, errorCode);
      break;
    case ERROR_CODES.DUPLICATE:
      error = new DuplicateError(details?.resource, details?.field, details?.value, errorCode);
      break;
    case ERROR_CODES.CONFLICT:
      error = new ConflictError(finalMessage, errorCode);
      break;
    case ERROR_CODES.INSUFFICIENT_FUNDS:
      error = new InsufficientFundsError(details?.required, details?.available, errorCode);
      break;
    case ERROR_CODES.BOOKING_CONFLICT:
      error = new BookingConflictError(finalMessage, errorCode);
      break;
    case ERROR_CODES.SERVICE_UNAVAILABLE:
      error = new ServiceUnavailableError(finalMessage, errorCode);
      break;
    case ERROR_CODES.DATABASE_ERROR:
      error = new DatabaseError(finalMessage, errorCode);
      break;
    case ERROR_CODES.CONNECTION_ERROR:
      error = new ConnectionError(finalMessage, errorCode);
      break;
    case ERROR_CODES.EXTERNAL_SERVICE_ERROR:
      error = new ExternalServiceError(details?.service, finalMessage, details?.originalError, errorCode);
      break;
    case ERROR_CODES.PAYMENT_GATEWAY_ERROR:
      error = new PaymentGatewayError(details?.gateway, finalMessage, details?.transactionId, errorCode);
      break;
    case ERROR_CODES.RATE_LIMIT:
      error = new RateLimitError(finalMessage, details?.retryAfter, errorCode);
      break;
    default:
      error = new AppError(finalMessage, statusCode || 500, errorCode);
  }
  
  return error;
}

// Error response formatter
export function formatErrorResponse(error: AppError): any {
  const response: any = {
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    }
  };

  // Add field errors for validation errors
  if (error instanceof ValidationError && Object.keys(error.fieldErrors).length > 0) {
    response.error.fieldErrors = error.fieldErrors;
  }

  // Add retry information for rate limit errors
  if (error instanceof RateLimitError) {
    response.error.retryAfter = error.retryAfter;
  }

  // Add service information for external service errors
  if (error instanceof ExternalServiceError) {
    response.error.service = error.service;
  }

  // Add gateway information for payment errors
  if (error instanceof PaymentGatewayError) {
    response.error.gateway = error.gateway;
    if (error.transactionId) {
      response.error.transactionId = error.transactionId;
    }
  }

  return response;
}

// Error logger
export function logError(error: AppError, context?: any): void {
  const logData = {
    timestamp: new Date().toISOString(),
    errorCode: error.errorCode,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    context: context || {}
  };

  if (error.statusCode >= 500) {
    console.error('🚨 CRITICAL ERROR:', logData);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️ CLIENT ERROR:', logData);
  } else {
    console.log('ℹ️ INFO:', logData);
  }
}
