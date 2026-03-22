/**
 * Password strength analysis service
 */

import {
  calculateEntropy,
  scorePasswordStrength,
  getPasswordStrength,
  estimateCrackTime,
} from '../utils/scoring';
import { logger } from '../utils/logger';

// Common weak passwords and patterns
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  '111111',
  '1234567',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'admin',
  'root',
  'toor',
  'pass',
  'test',
  'guest',
  'user',
];

const COMMON_PATTERNS = [
  /^[0-9]+$/,
  /^[a-z]+$/i,
  /^(.)\\1+$/,
  /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i,
  /^(qwerty|asdfgh|zxcvbn)/i,
];

/**
 * Check if password is a common/weak password
 */
export const isCommonPassword = (password: string): boolean => {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.includes(lower);
};

/**
 * Check if password follows a common pattern
 */
export const hasCommonPattern = (password: string): boolean => {
  return COMMON_PATTERNS.some((pattern) => pattern.test(password));
};

/**
 * Check for sequential characters
 */
export const hasSequentialCharacters = (password: string): boolean => {
  for (let i = 0; i < password.length - 2; i++) {
    const code1 = password.charCodeAt(i);
    const code2 = password.charCodeAt(i + 1);
    const code3 = password.charCodeAt(i + 2);

    if (code2 === code1 + 1 && code3 === code2 + 1) {
      return true;
    }
  }
  return false;
};

/**
 * Check for repeated characters
 */
export const hasRepeatedCharacters = (password: string): boolean => {
  return /(.)\1{2,}/.test(password);
};

/**
 * Analyze password attributes
 */
export interface PasswordAnalysis {
  length: number;
  entropy: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  score: number;
  has_uppercase: boolean;
  has_lowercase: boolean;
  has_numbers: boolean;
  has_special_chars: boolean;
  common_word: boolean;
  crack_time_seconds: number;
  issues: string[];
}

/**
 * Analyze password strength comprehensively
 */
export const analyzePassword = (password: string): PasswordAnalysis => {
  logger.info('Analyzing password strength');

  const analysis: PasswordAnalysis = {
    length: password.length,
    entropy: calculateEntropy(password),
    has_uppercase: /[A-Z]/.test(password),
    has_lowercase: /[a-z]/.test(password),
    has_numbers: /[0-9]/.test(password),
    has_special_chars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    common_word: isCommonPassword(password),
    crack_time_seconds: estimateCrackTime(password),
    issues: [],
    score: 0,
    strength: 'weak',
  };

  // Calculate base score
  analysis.score = scorePasswordStrength(password);
  analysis.strength = getPasswordStrength(analysis.score);

  // Identify issues
  if (analysis.length < 8) {
    analysis.issues.push('Password is less than 8 characters');
  }

  if (!analysis.has_uppercase) {
    analysis.issues.push('Missing uppercase letters');
  }

  if (!analysis.has_lowercase) {
    analysis.issues.push('Missing lowercase letters');
  }

  if (!analysis.has_numbers) {
    analysis.issues.push('Missing numbers');
  }

  if (!analysis.has_special_chars) {
    analysis.issues.push('Missing special characters');
  }

  if (analysis.common_word) {
    analysis.issues.push('Uses a common password');
    analysis.score -= 30;
  }

  if (hasCommonPattern(password)) {
    analysis.issues.push('Follows a common pattern');
    analysis.score -= 20;
  }

  if (hasSequentialCharacters(password)) {
    analysis.issues.push('Contains sequential characters');
    analysis.score -= 10;
  }

  if (hasRepeatedCharacters(password)) {
    analysis.issues.push('Contains repeated characters');
    analysis.score -= 10;
  }

  // Clamp score
  analysis.score = Math.max(0, Math.min(100, analysis.score));
  analysis.strength = getPasswordStrength(analysis.score);

  return analysis;
};

/**
 * Generate password strength recommendations
 */
export const getPasswordRecommendations = (analysis: PasswordAnalysis): string[] => {
  const recommendations: string[] = [];

  if (analysis.length < 12) {
    recommendations.push('Use at least 12 characters');
  }

  if (!analysis.has_uppercase) {
    recommendations.push('Include uppercase letters (A-Z)');
  }

  if (!analysis.has_lowercase) {
    recommendations.push('Include lowercase letters (a-z)');
  }

  if (!analysis.has_numbers) {
    recommendations.push('Include numbers (0-9)');
  }

  if (!analysis.has_special_chars) {
    recommendations.push('Include special characters (!@#$%^&*)');
  }

  if (analysis.entropy < 50) {
    recommendations.push('Increase password complexity');
  }

  if (analysis.common_word) {
    recommendations.push('Avoid using common words or phrases');
  }

  if (!recommendations.length) {
    recommendations.push('Password meets security standards');
  }

  return recommendations;
};

export default {
  analyzePassword,
  isCommonPassword,
  hasCommonPattern,
  hasSequentialCharacters,
  hasRepeatedCharacters,
  getPasswordRecommendations,
};
