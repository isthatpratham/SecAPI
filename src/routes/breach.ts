/**
 * Email Breach Check route handler
 */

import { Router, Request, Response, NextFunction } from 'express';
import { EmailSchema } from '../utils/validators';
import { checkEmailBreach } from '../services/breachChecker';
import { createRiskAssessment } from '../utils/scoring';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Recommendation } from '../types';

const router = Router();

/**
 * POST /api/v1/check/email-breach
 * Check if email has appeared in data breaches
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const validation = await EmailSchema.parseAsync(req.body);
      const { email } = validation;

      logger.info('Checking email breach status', {
        email: email.substring(0, 3) + '***',
      });

      // Check breach status
      const breachData = await checkEmailBreach(email);

      // Calculate risk score
      const riskScore = breachData.breached ? 90 : 10;

      // Generate recommendations
      const recommendations: Recommendation[] = [];

      if (breachData.breached) {
        recommendations.push({
          priority: 'high',
          message: `Email found in ${breachData.breaches.length} data breach(es)`,
          action: 'Change passwords immediately for all accounts using this email',
        });

        // Identify affected data
        const allDataClasses = new Set<string>();
        breachData.breaches.forEach((b) => {
          b.data_classes.forEach((dc) => allDataClasses.add(dc));
        });

        if (allDataClasses.has('Passwords')) {
          recommendations.push({
            priority: 'high',
            message: 'Passwords were exposed in these breaches',
            action: 'Update passwords immediately',
          });
        }

        if (allDataClasses.has('Email addresses')) {
          recommendations.push({
            priority: 'medium',
            message: 'Email address was compromised',
            action: 'Watch for phishing and spam',
          });
        }
      } else {
        recommendations.push({
          priority: 'low',
          message: 'Email not found in known data breaches',
          action: 'Continue monitoring for future breaches',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          email: email.substring(0, 3) + '***' + email.substring(email.indexOf('@')),
          breached: breachData.breached,
          breach_count: breachData.breaches.length,
          breaches: breachData.breaches,
          riskScore: createRiskAssessment(riskScore, [
            `Breaches: ${breachData.breaches.length}`,
            breachData.breaches.map((b) => b.name).join(', ') || 'None',
          ]),
          recommendations,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          next(new AppError('INVALID_EMAIL', 400, 'Invalid email format'));
        } else if (error.message.includes('rate limited')) {
          next(new AppError('SERVICE_UNAVAILABLE', 503, error.message));
        } else {
          next(new AppError('BREACH_CHECK_FAILED', 500, 'Failed to check breach status'));
        }
      } else {
        next(error);
      }
    }
  }
);

export default router;
