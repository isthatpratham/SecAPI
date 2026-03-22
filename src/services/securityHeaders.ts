/**
 * Security Headers analysis service
 */

import axios from 'axios';
import { SecurityHeaders } from '../types';
import { CONSTANTS } from '../config/constants';
import { scoreSecurityHeaders } from '../utils/scoring';
import { logger } from '../utils/logger';

/**
 * Fetch security headers from a URL
 */
export const fetchSecurityHeaders = async (url: string): Promise<SecurityHeaders> => {
  try {
    const response = await axios.head(url, {
      timeout: CONSTANTS.API.TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const headers: SecurityHeaders = {};

    // Extract security-relevant headers
    const securityHeaderNames = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'content-security-policy',
      'referrer-policy',
      'permissions-policy',
      'expect-ct',
      'x-permitted-cross-domain-policies',
      'x-powered-by',
    ];

    securityHeaderNames.forEach((headerName) => {
      const value = response.headers[headerName];
      if (value) {
        headers[headerName] = value;
      }
    });

    return headers;
  } catch (error) {
    logger.error('Error fetching security headers:', { url, error });
    return {};
  }
};

/**
 * Analyze security headers for issues
 */
export const analyzeSecurityHeaders = (
  headers: SecurityHeaders
): {
  missing: string[];
  present: string[];
  score: number;
} => {
  const presentHeaders = Object.keys(headers).map((h) => h.toLowerCase());
  const missingHeaders = CONSTANTS.SECURITY_HEADERS.REQUIRED.filter(
    (h) => !presentHeaders.includes(h)
  );

  const score = scoreSecurityHeaders(presentHeaders, CONSTANTS.SECURITY_HEADERS.REQUIRED);

  return {
    missing: missingHeaders,
    present: presentHeaders,
    score,
  };
};

/**
 * Check for security header vulnerabilities
 */
export const checkHeaderVulnerabilities = (
  headers: SecurityHeaders
): { vulnerability: string; severity: string }[] => {
  const vulnerabilities: { vulnerability: string; severity: string }[] = [];

  // Check for missing HSTS
  if (!headers['strict-transport-security']) {
    vulnerabilities.push({
      vulnerability: 'Missing HSTS header',
      severity: 'high',
    });
  }

  // Check for missing X-Content-Type-Options
  if (!headers['x-content-type-options']) {
    vulnerabilities.push({
      vulnerability: 'Missing X-Content-Type-Options header',
      severity: 'medium',
    });
  }

  // Check for missing X-Frame-Options
  if (!headers['x-frame-options']) {
    vulnerabilities.push({
      vulnerability: 'Missing X-Frame-Options header (clickjacking vulnerability)',
      severity: 'medium',
    });
  }

  // Check for outdated X-XSS-Protection
  if (headers['x-xss-protection'] === '0') {
    vulnerabilities.push({
      vulnerability: 'X-XSS-Protection is disabled',
      severity: 'low',
    });
  }

  // Check for missing CSP
  if (!headers['content-security-policy']) {
    vulnerabilities.push({
      vulnerability: 'Missing Content-Security-Policy header',
      severity: 'high',
    });
  }

  // Check for permissive CSP
  const csp = headers['content-security-policy'] as string | undefined;
  if (csp && csp.includes('unsafe-inline')) {
    vulnerabilities.push({
      vulnerability: 'CSP contains unsafe-inline directive',
      severity: 'medium',
    });
  }

  return vulnerabilities;
};

export default {
  fetchSecurityHeaders,
  analyzeSecurityHeaders,
  checkHeaderVulnerabilities,
};
