/**
 * Express app initialization and server startup
 */

import 'dotenv/config';
import http from 'http';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

let server: http.Server;

/**
 * Start the server
 */
const startServer = (): void => {
  server = http.createServer(app);

  server.listen(config.port, () => {
    logger.info(`Server started successfully`, {
      port: config.port,
      environment: config.nodeEnv,
      apiVersion: config.apiVersion,
      docs: `http://localhost:${config.port}/api/v1/health`,
    });
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = `Port ${config.port}`;
    switch (error.code) {
      case 'EACCES':
        logger.error(`${bind} requires elevated privileges`, { error });
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(`${bind} is already in use`, { error });
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (): void => {
  logger.info('Shutting down gracefully...');

  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

/**
 * Register shutdown handlers
 */
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', { reason });
  process.exit(1);
});

/**
 * Start the server
 */
if (require.main === module) {
  startServer();
}

export default app;
