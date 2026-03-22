/**
 * Risk scoring algorithms for security assessment
 */

import { RiskAssessment } from '../types';
import { CONSTANTS } from '../config/constants';

/**
 * Calculate risk score based on individual risk factors
 * Returns a score between 0-100
 */
export const calculateRiskScore = (factors: number[]): number => {
  if (factors.length === 0) return 0;
  const average = factors.reduce((a, b) => a + b, 0) / factors.length;
  return Math.min(Math.max(Math.round(average), 0), 100);
};

/**
 * Determine risk level based on score
 */
export const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score < CONSTANTS.RISK_THRESHOLDS.LOW) return 'low';
  if (score < CONSTANTS.RISK_THRESHOLDS.MEDIUM) return 'medium';
  if (score < CONSTANTS.RISK_THRESHOLDS.HIGH) return 'high';
  return 'critical';
};

/**
 * Create a Risk Assessment object
 */
export const createRiskAssessment = (
  score: number,
  factors: string[]
): RiskAssessment => {
  return {
    score,
    level: getRiskLevel(score),
    factors,
  };
};

/**
 * Score SSL certificate validity
 * Returns 0 (safe) to 100 (risky)
 */
export const scoreSSLCertificate = (daysRemaining: number): number => {
  if (daysRemaining < 0) return 100; // Expired
  if (daysRemaining < 7) return 90; // Critical
  if (daysRemaining < 30) return 70; // High
  if (daysRemaining < 90) return 40; // Medium
  return 10; // Low risk
};

/**
 * Score security headers
 * Returns 0 (all present) to 100 (none present)
 */
export const scoreSecurityHeaders = (
  presentHeaders: string[],
  requiredHeaders: string[]
): number => {
  const missingHeaders = requiredHeaders.filter(
    (header) => !presentHeaders.includes(header.toLowerCase())
  );
  const missingPercentage = (missingHeaders.length / requiredHeaders.length) * 100;
  return Math.round(missingPercentage);
};

/**
 * Score domain age and reputation
 * Returns 0 (established) to 100 (suspicious)
 */
export const scoreDomainAge = (ageDays?: number): number => {
  if (!ageDays) return 70; // Unknown age is risky
  if (ageDays < 30) return 80; // Very new domain
  if (ageDays < 90) return 60; // New domain
  if (ageDays < 365) return 40; // Relatively new
  return 10; // Established domain
};

/**
 * Calculate password entropy
 */
export const calculateEntropy = (password: string): number => {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;

  const entropy = password.length * Math.log2(charsetSize);
  return Math.round(entropy * 100) / 100;
};

/**
 * Score password strength
 * Returns a score from 0 (weak) to 100 (very strong)
 */
export const scorePasswordStrength = (password: string): number => {
  let score = 0;

  // Length scoring
  score += Math.min(password.length * 5, 30);

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  // Entropy bonus
  const entropy = calculateEntropy(password);
  if (entropy > 60) score += 20;
  else if (entropy > 40) score += 10;

  return Math.min(score, 100);
};

/**
 * Determine password strength level
 */
export const getPasswordStrength = (
  score: number
): 'weak' | 'fair' | 'good' | 'strong' | 'very_strong' => {
  if (score < 25) return 'weak';
  if (score < 50) return 'fair';
  if (score < 70) return 'good';
  if (score < 85) return 'strong';
  return 'very_strong';
};

/**
 * Estimate time to crack password (in seconds)
 * Assumes 10 billion guesses per second
 */
export const estimateCrackTime = (password: string): number => {
  const entropy = calculateEntropy(password);
  const possibleCombinations = 2 ** entropy;
  const guessesPerSecond = 10_000_000_000; // 10 billion
  const averageSecondsToGuess = possibleCombinations / (2 * guessesPerSecond);
  return Math.round(averageSecondsToGuess);
};
