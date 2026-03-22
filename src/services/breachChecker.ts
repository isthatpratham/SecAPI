/**
 * Breach checker service for HaveIBeenPwned API integration
 */

import axios from 'axios';
import { CONSTANTS } from '../config/constants';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface BreachRecord {
  name: string;
  date: string;
  data_classes: string[];
}

/**
 * Check if email has been breached using HaveIBeenPwned API
 */
export const checkEmailBreach = async (
  email: string
): Promise<{
  breached: boolean;
  breaches: BreachRecord[];
}> => {
  try {
    // HaveIBeenPwned API requires a User-Agent header
    const response = await axios.get(`${CONSTANTS.HIBP.BASE_URL}/breachedaccount`, {
      params: {
        account: email,
        includeUnverified: true,
      },
      headers: {
        'User-Agent': 'SecurityIntelligenceAPI/1.0.0',
        ...(config.hibpApiKey && { 'hibp-api-key': config.hibpApiKey }),
      },
      timeout: CONSTANTS.HIBP.TIMEOUT_MS,
    });

    const breaches: BreachRecord[] = response.data.map((breach: any) => ({
      name: breach.Name,
      date: breach.BreachDate,
      data_classes: breach.DataClasses,
    }));

    logger.info('Email breach check completed', {
      email: email.substring(0, 3) + '***',
      breach_count: breaches.length,
    });

    return {
      breached: breaches.length > 0,
      breaches,
    };
  } catch (error: any) {
    // 404 means not breached
    if (error.response?.status === 404) {
      logger.info('Email not found in breaches', {
        email: email.substring(0, 3) + '***',
      });
      return {
        breached: false,
        breaches: [],
      };
    }

    // Rate limited - HIBP API limits requests
    if (error.response?.status === 429) {
      logger.warn('HIBP API rate limited');
      throw new Error('Breach check service temporarily unavailable (rate limited)');
    }

    logger.error('Error checking email breach:', { error: String(error) });
    throw new Error('Failed to check email breach status');
  }
};

/**
 * Check if password appears in common breach databases (mock implementation)
 * In production, integrate with actual password checking APIs like haveibeenpwned.com/api/Passwords
 */
export const checkPasswordBreach = async (
  password: string
): Promise<{
  breached: boolean;
  occurrence_count: number;
}> => {
  try {
    logger.info('Checking password against breach databases');

    // Mock implementation - would use SHA-1 hashing and HIBP Passwords API in production
    const commonBreachedPasswords = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
    ];

    const isCommon = commonBreachedPasswords.includes(password.toLowerCase());

    return {
      breached: isCommon,
      occurrence_count: isCommon ? 1000000 : 0, // Mock count
    };
  } catch (error) {
    logger.error('Error checking password breach:', { error });
    return {
      breached: false,
      occurrence_count: 0,
    };
  }
};

/**
 * Get latest breaches
 */
export const getLatestBreaches = async (): Promise<BreachRecord[]> => {
  try {
    const response = await axios.get(`${CONSTANTS.HIBP.BASE_URL}/breaches`, {
      headers: {
        'User-Agent': 'SecurityIntelligenceAPI/1.0.0',
      },
      timeout: CONSTANTS.HIBP.TIMEOUT_MS,
    });

    return response.data
      .slice(0, 10)
      .map((breach: any) => ({
        name: breach.Name,
        date: breach.BreachDate,
        data_classes: breach.DataClasses,
      }));
  } catch (error) {
    logger.error('Error fetching latest breaches:', { error });
    return [];
  }
};

export default {
  checkEmailBreach,
  checkPasswordBreach,
  getLatestBreaches,
};
