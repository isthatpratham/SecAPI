/**
 * Request validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

/**
 * Create a validation middleware function
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      logger.warn('Request validation failed:', {
        path: req.path,
        method: req.method,
        errors: error.errors,
      });

      const message = error.errors?.[0]?.message || 'Request validation failed';
      throw new AppError('VALIDATION_ERROR', 400, message);
    }
  };
};

/**
 * Middleware to validate and attach parsed body
 */
export const bodyValidator =
  (schema: ZodSchema) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      next(error);
    }
  };

export default validateRequest;
