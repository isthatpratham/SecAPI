/**
 * Domain Checker route handler
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DomainSchema } from '../utils/validators';
import {
  checkTyposquatting,
  getDomainSuspicionScore,
  analyzeDomainReputation,
} from '../services/domainAnalysis';
import { createRiskAssessment, calculateRiskScore } from '../utils/scoring';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Recommendation } from '../types';

const router = Router();

/**
 * POST /api/v1/scan/domain
 * Check domain for phishing, typosquatting, and reputation
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const validation = await DomainSchema.parseAsync(req.body);
      const { domain } = validation;

      logger.info('Checking domain', { domain });

      // Check for typosquatting
      const isTyposquatting = checkTyposquatting(domain);

      // Get suspicion score
      const suspicionScore = getDomainSuspicionScore(domain);

      // Analyze reputation
      const reputation = await analyzeDomainReputation(domain);

      // Calculate risk factors
      const riskFactors = [suspicionScore, reputation.reputation_score];

      const riskScore = calculateRiskScore(riskFactors);

      // Generate recommendations
      const recommendations: Recommendation[] = [];

      if (isTyposquatting) {
        recommendations.push({
          priority: 'high',
          message: 'Domain appears to be a typosquatting attempt',
          action: 'Verify domain legitimacy before proceeding',
        });
      }

      if (suspicionScore > 50) {
        recommendations.push({
          priority: 'high',
          message: 'Domain exhibits characteristics associated with phishing',
          action: 'Exercise caution and verify domain ownership',
        });
      }

      if (suspicionScore > 25) {
        recommendations.push({
          priority: 'medium',
          message: 'Domain has moderate suspicion indicators',
          action: 'Validate domain information independently',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          domain,
          is_registered: reputation.is_registered,
          phishing_score: suspicionScore,
          typosquatting_risk: isTyposquatting,
          age_days: 365, // Mock data
          riskScore: createRiskAssessment(riskScore, [
            `Typosquatting: ${isTyposquatting ? 'Yes' : 'No'}`,
            `Suspicion score: ${suspicionScore}`,
            `Registered: ${reputation.is_registered}`,
          ]),
          recommendations,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        next(new AppError('INVALID_DOMAIN', 400, 'Invalid domain format'));
      } else {
        next(error);
      }
    }
  }
);

export default router;
