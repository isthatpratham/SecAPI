/**
 * Password Check route handler
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PasswordSchema } from '../utils/validators';
import { analyzePassword, getPasswordRecommendations } from '../services/passwordAnalyzer';
import { createRiskAssessment } from '../utils/scoring';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Recommendation } from '../types';

const router = Router();

/**
 * POST /api/v1/check/password
 * Analyze password strength and security
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const validation = await PasswordSchema.parseAsync(req.body);
      const { password } = validation;

      logger.info('Analyzing password strength');

      // Analyze password
      const analysis = analyzePassword(password);

      // Calculate risk score (inverse of strength)
      const riskScore = 100 - Math.round(analysis.score);

      // Get recommendations
      const recommendationStrings = getPasswordRecommendations(analysis);
      const recommendations: Recommendation[] = recommendationStrings.map((rec, index) => ({
        priority:
          index === 0 && analysis.issues.length > 0 ? 'high'
          : analysis.strength === 'weak' ? 'high'
          : analysis.strength === 'fair' ? 'medium'
          : 'low',
        message: rec,
      }));

      res.status(200).json({
        success: true,
        data: {
          password_length: analysis.length,
          entropy: analysis.entropy,
          strength: analysis.strength,
          has_uppercase: analysis.has_uppercase,
          has_lowercase: analysis.has_lowercase,
          has_numbers: analysis.has_numbers,
          has_special_chars: analysis.has_special_chars,
          common_word: analysis.common_word,
          crack_time_seconds: analysis.crack_time_seconds,
          riskScore: createRiskAssessment(riskScore, analysis.issues),
          recommendations,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        next(new AppError('INVALID_PASSWORD', 400, 'Invalid password format'));
      } else {
        next(error);
      }
    }
  }
);

export default router;
