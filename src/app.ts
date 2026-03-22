/**
 * Express app configuration, middleware, and routes
 */

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { logger } from './utils/logger';

/**
 * Create and configure Express app
 */
export const createApp = (): Express => {
  const app = express();

  // Security: Helmet middleware for setting various HTTP headers
  app.use(helmet());

  // CORS middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging middleware
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Rate limiting middleware (skip health check)
  app.use(apiLimiter);

  // Mount API routes under /api/v1
  app.use('/api/v1', apiRoutes);

  // 404 handler (must be after all route handlers)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

/**
 * Create the Express app instance
 */
const app = createApp();

export default app;
