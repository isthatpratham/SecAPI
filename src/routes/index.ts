/**
 * Combine all routes
 */

import { Router } from 'express';
import healthRoutes from './health';
import urlScannerRoutes from './urlScanner';
import domainCheckerRoutes from './domainChecker';
import passwordRoutes from './password';
import breachRoutes from './breach';

const router = Router();

// Health check endpoint (not rate limited)
router.use('/health', healthRoutes);

// API endpoints (rate limited)
router.use('/scan/url', urlScannerRoutes);
router.use('/scan/domain', domainCheckerRoutes);
router.use('/check/password', passwordRoutes);
router.use('/check/email-breach', breachRoutes);

export default router;
