/**
 * URL Scanner route handler
 */

import { Router, Request, Response, NextFunction } from 'express';
import { URLSchema } from '../utils/validators';
import { fetchSecurityHeaders, analyzeSecurityHeaders } from '../services/securityHeaders';
import { getSSLCertificateInfo, validateSSLCertificate } from '../services/sslChecker';
import { createRiskAssessment, calculateRiskScore, scoreSSLCertificate } from '../utils/scoring';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Recommendation } from '../types';

const router = Router();

/**
 * POST /api/v1/scan/url
 * Scan URL for security vulnerabilities
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const validation = await URLSchema.parseAsync(req.body);
      const { url } = validation;

      logger.info('Scanning URL', { url });

      const startTime = Date.now();

      // Fetch security headers
      const headers = await fetchSecurityHeaders(url);
      const headerAnalysis = analyzeSecurityHeaders(headers);

      // Fetch SSL certificate
      const sslCert = await getSSLCertificateInfo(url);
      const sslValidation = validateSSLCertificate(sslCert);

      // Calculate risk factors
      const riskFactors = [headerAnalysis.score];

      if (sslCert) {
        riskFactors.push(scoreSSLCertificate(sslCert.days_remaining));
      } else {
        riskFactors.push(50); // No HTTPS is a moderate risk
      }

      const riskScore = calculateRiskScore(riskFactors);

      // Generate recommendations
      const recommendations: Recommendation[] = [];

      if (headerAnalysis.missing.length > 0) {
        recommendations.push({
          priority: 'high',
          message: `Missing security headers: ${headerAnalysis.missing.join(', ')}`,
          action: 'Add recommended security headers to all responses',
        });
      }

      if (!sslValidation.is_valid) {
        recommendations.push({
          priority: 'high',
          message: sslValidation.issues.join('; '),
          action: 'Renew or update SSL certificate',
        });
      }

      if (Object.keys(headers).length === 0) {
        recommendations.push({
          priority: 'high',
          message: 'No security headers detected',
          action: 'Implement comprehensive security header policy',
        });
      }

      const responseTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        data: {
          url,
          headers,
          ssl: sslCert,
          riskScore: createRiskAssessment(riskScore, [
            `Missing headers: ${headerAnalysis.missing.length}`,
            ...(sslCert
              ? [`SSL valid: ${sslCert.is_valid}`, `Days remaining: ${sslCert.days_remaining}`]
              : ['No HTTPS']),
          ]),
          recommendations,
          responseTime,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid URL')) {
        next(new AppError('INVALID_URL', 400, 'Invalid URL format'));
      } else {
        next(error);
      }
    }
  }
);

export default router;
