/**
 * API Constants and configuration thresholds
 */

export const CONSTANTS = {
  // Risk scoring thresholds
  RISK_THRESHOLDS: {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 90,
  },

  // Password analysis
  PASSWORD: {
    MIN_LENGTH: 8,
    ENTROPY_THRESHOLDS: {
      WEAK: 20,
      FAIR: 35,
      GOOD: 60,
      STRONG: 90,
    },
    CRACK_TIME: {
      SECOND: 1,
      MINUTE: 60,
      HOUR: 3600,
      DAY: 86400,
      YEAR: 31536000,
    },
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false,
  },

  // API
  API: {
    VERSION: '1.0.0',
    TIMEOUT_MS: 10000,
    CACHE_TTL_SECONDS: 3600,
  },

  // External APIs
  HIBP: {
    BASE_URL: 'https://haveibeenpwned.com/api/v3',
    TIMEOUT_MS: 5000,
  },

  // Domain analysis
  DOMAIN: {
    PHISHING_SCORE_THRESHOLD: 50,
    TYPOSQUATTING_COMMON_DOMAINS: [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'apple.com',
      'amazon.com',
      'microsoft.com',
      'google.com',
      'facebook.com',
      'twitter.com',
    ],
  },

  // Security headers
  SECURITY_HEADERS: {
    REQUIRED: [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'content-security-policy',
    ],
    RECOMMENDED: [
      'referrer-policy',
      'permissions-policy',
      'expect-ct',
    ],
  },
};

export default CONSTANTS;
