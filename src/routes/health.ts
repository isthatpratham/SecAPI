/**
 * Health check route handler
 */

import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      version: config.apiVersion,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
