/**
 * Rate limiting middleware using express-rate-limit
 */

import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

/**
 * Main API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/v1/health';
  },
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (_req, res) => {
    logger.warn('Rate limit exceeded for IP: ' + _req.ip);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for authentication endpoints (if added later)
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: 5,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    logger.warn('Auth rate limit exceeded for IP: ' + _req.ip);
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

export default apiLimiter;
