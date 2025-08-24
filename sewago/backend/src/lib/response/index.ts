import { Response } from 'express';
import { AppError, formatErrorResponse, logError } from '../errors/index.js';
import { ApiResponse } from '../../types/index.js';

// Success response handler
export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date()
  };

  res.status(statusCode).json(response);
}

// Error response handler
export function sendErrorResponse(
  res: Response,
  error: AppError | Error,
  context?: any
): void {
  let appError: AppError;

  // Convert generic errors to AppError if needed
  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = new AppError(
      error.message || 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }

  // Log the error
  logError(appError, context);

  // Format error response
  const errorResponse = formatErrorResponse(appError);

  // Send response
  res.status(appError.statusCode).json(errorResponse);
}

// Not found response
export function sendNotFoundResponse(
  res: Response,
  resource: string,
  id?: string
): void {
  const error = new AppError(
    id ? `${resource} with id '${id}' not found` : `${resource} not found`,
    404,
    'NOT_FOUND'
  );

  sendErrorResponse(res, error);
}

// Validation error response
export function sendValidationErrorResponse(
  res: Response,
  fieldErrors: Record<string, string[]>
): void {
  const error = new AppError(
    'Validation failed',
    400,
    'VALIDATION_FAILED'
  );

  // Add field errors to the error object
  (error as any).fieldErrors = fieldErrors;

  sendErrorResponse(res, error);
}

// Authentication error response
export function sendAuthErrorResponse(
  res: Response,
  message: string = 'Authentication failed'
): void {
  const error = new AppError(message, 401, 'AUTH_FAILED');
  sendErrorResponse(res, error);
}

// Authorization error response
export function sendForbiddenResponse(
  res: Response,
  message: string = 'Access denied'
): void {
  const error = new AppError(message, 403, 'ACCESS_DENIED');
  sendErrorResponse(res, error);
}

// Conflict error response
export function sendConflictResponse(
  res: Response,
  message: string = 'Resource conflict'
): void {
  const error = new AppError(message, 409, 'CONFLICT');
  sendErrorResponse(res, error);
}

// Rate limit error response
export function sendRateLimitResponse(
  res: Response,
  retryAfter: number = 60
): void {
  const error = new AppError(
    'Rate limit exceeded',
    429,
    'RATE_LIMIT'
  );

  // Add retry information
  (error as any).retryAfter = retryAfter;

  sendErrorResponse(res, error);
}

// Paginated response handler
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Data retrieved successfully'
): void {
  const response: ApiResponse<{
    data: T[];
    pagination: typeof pagination;
  }> = {
    success: true,
    message,
    data: {
      data,
      pagination
    },
    timestamp: new Date()
  };

  res.status(200).json(response);
}

// Created response handler
export function sendCreatedResponse<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void {
  sendSuccessResponse(res, data, message, 201);
}

// Updated response handler
export function sendUpdatedResponse<T>(
  res: Response,
  data: T,
  message: string = 'Resource updated successfully'
): void {
  sendSuccessResponse(res, data, message, 200);
}

// Deleted response handler
export function sendDeletedResponse(
  res: Response,
  message: string = 'Resource deleted successfully'
): void {
  sendSuccessResponse(res, null, message, 200);
}

// No content response
export function sendNoContentResponse(res: Response): void {
  res.status(204).send();
}

// File download response
export function sendFileResponse(
  res: Response,
  filePath: string,
  fileName: string,
  contentType: string = 'application/octet-stream'
): void {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.sendFile(filePath);
}

// Stream response
export function sendStreamResponse(
  res: Response,
  stream: NodeJS.ReadableStream,
  contentType: string = 'application/octet-stream'
): void {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  stream.pipe(res);
}

// Health check response
export function sendHealthResponse(
  res: Response,
  status: 'healthy' | 'degraded' | 'critical',
  details?: any
): void {
  const response: ApiResponse<{
    status: string;
    timestamp: string;
    details?: any;
  }> = {
    success: status === 'healthy',
    message: `System is ${status}`,
    data: {
      status,
      timestamp: new Date().toISOString(),
      details
    },
    timestamp: new Date()
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(response);
}

// Maintenance mode response
export function sendMaintenanceResponse(
  res: Response,
  estimatedDuration?: string
): void {
  const response: ApiResponse<{
    maintenance: boolean;
    estimatedDuration?: string;
    timestamp: string;
  }> = {
    success: false,
    message: 'System is under maintenance',
    data: {
      maintenance: true,
      estimatedDuration,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date()
  };

  res.status(503).json(response);
}

// All functions are already exported above
