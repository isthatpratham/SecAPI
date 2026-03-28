/**
 * Domain analysis service for phishing detection and typosquatting
 */

import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

/**
 * Check if domain is a typosquatting attempt
 */
export const checkTyposquatting = (domain: string): boolean => {
  const cleanDomain = domain.toLowerCase().replace('www.', '');
  const commonDomains = CONSTANTS.DOMAIN.TYPOSQUATTING_COMMON_DOMAINS;

  for (const commonDomain of commonDomains) {
    // Check for common typos
    if (
      checkSimilarity(cleanDomain, commonDomain) > 0.85 ||
      checkDomainMutation(cleanDomain, commonDomain)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Check Levenshtein distance between two strings for similarity
 */
const checkSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  const editDistance = calculateLevenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance
 */
const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Check for common domain mutations (homograph attacks)
 */
const checkDomainMutation = (domain: string, target: string): boolean => {
  // Check for character substitution (l -> 1, o -> 0, etc.)
  const mutations = [
    [/l/g, '1'],
    [/o/g, '0'],
    [/s/g, '5'],
    [/i/g, '!'],
  ];

  for (const [char, replacement] of mutations) {
    if (domain.replace(char as RegExp, replacement as string) === target) {
      return true;
    }
  }

  // Check for homograph attacks with similar-looking characters
  const cyrillic_a = String.fromCharCode(0x0430); // а (Cyrillic a)
  if (domain.includes(cyrillic_a)) {
    return true;
  }

  return false;
};

/**
 * Check if domain appears suspicious based on characteristics
 */
export const getDomainSuspicionScore = (domain: string): number => {
  let score = 0;

  // Check for typosquatting
  if (checkTyposquatting(domain)) {
    score += 40;
  }

  // Check for suspicious TLDs
  const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf'];
  const tld = domain.split('.').pop()?.toLowerCase();
  if (tld && suspiciousTLDs.includes(tld)) {
    score += 20;
  }

  // Check for excessive hyphens (common in phishing)
  if ((domain.match(/-/g) || []).length > 2) {
    score += 15;
  }

  // Check for numerical tricks
  if (/\d{3,}/.test(domain)) {
    score += 10;
  }

  // Check for very short domain
  if (domain.length < 4) {
    score += 5;
  }

  return Math.min(score, 100);
};

/**
 * Extract domain name from URL or domain string
 */
export const extractDomain = (urlOrDomain: string): string | null => {
  try {
    // If it's a URL
    if (urlOrDomain.startsWith('http://') || urlOrDomain.startsWith('https://')) {
      return new URL(urlOrDomain).hostname?.toLowerCase() || null;
    }
    // If it's a domain
    return urlOrDomain.toLowerCase();
  } catch {
    return null;
  }
};

/**
 * Validate domain format - must contain at least one dot and valid characters
 */
const isValidDomain = (domain: string): boolean => {
  if (!domain || domain.length === 0) return false;
  // Domain must have at least one dot and alphanumeric characters
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return domainRegex.test(domain) || domain.includes('.');
};

/**
 * Analyze domain reputation
 * This is a mock implementation - in production, integrate with actual threat intelligence APIs
 */
export const analyzeDomainReputation = async (
  domain: string
): Promise<{
  is_registered: boolean;
  reputation_score: number;
  last_seen?: string;
}> => {
  // Validate domain input before processing
  if (!isValidDomain(domain)) {
    logger.warn('Invalid domain format provided for analysis', { domain: '***' });
    return {
      is_registered: false,
      reputation_score: 0,
    };
  }

  try {
    logger.info('Analyzing domain reputation:', { domain });

    // Mock data - in production, check against threat databases
    const suspicion = getDomainSuspicionScore(domain);

    return {
      is_registered: true, // Mock - would check WHOIS
      reputation_score: suspicion,
      last_seen: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error analyzing domain reputation:', { domain, error });
    return {
      is_registered: false,
      reputation_score: 50,
    };
  }
};

export default {
  checkTyposquatting,
  getDomainSuspicionScore,
  extractDomain,
  analyzeDomainReputation,
};
