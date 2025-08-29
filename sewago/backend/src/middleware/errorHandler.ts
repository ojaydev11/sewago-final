import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  path?: string;
  value?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details: any = null;

  // Log error for debugging (exclude sensitive data)
  console.error(`[${req.requestId || 'unknown'}] ${req.method} ${req.url}:`, {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    if (error instanceof MongooseError.ValidationError) {
      details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
    }
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
    const field = Object.keys((error as any).keyValue || {})[0];
    if (field) {
      details = { field, message: `${field} already exists` };
    }
  }

  // MongoDB cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Rate limit errors (already handled by rate limit middleware)
  if (statusCode === 429) {
    // Don't override rate limit messages
  }

  // Security: Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(req.requestId && { requestId: req.requestId }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    ...(req.requestId && { requestId: req.requestId }),
  });
};

// Async error wrapper to catch unhandled promise rejections
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
