/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      statusCode,
      code,
      message,
      stack: error.stack,
      timestamp,
    });
  } else {
    logger.warn('Client error:', {
      statusCode,
      code,
      message,
    });
  }

  // Send response
  const response: ApiError & { timestamp: string } = {
    code,
    message,
    statusCode,
    timestamp,
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json({
    success: false,
    error: response,
    timestamp,
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
