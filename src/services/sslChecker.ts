/**
 * SSL/TLS certificate validation service
 */

import https from 'https';
import tls from 'tls';
import { URL } from 'url';
import { SSLInfo } from '../types';
import { logger } from '../utils/logger';

/**
 * Fetch SSL certificate information from a URL
 */
export const getSSLCertificateInfo = async (urlString: string): Promise<SSLInfo | null> => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    if (url.protocol !== 'https:') {
      logger.info('URL does not use HTTPS protocol', { urlString });
      return null;
    }

    return new Promise((resolve) => {
      const req = https.get(
        {
          hostname,
          port: 443,
          method: 'HEAD',
          timeout: 10000,
          rejectUnauthorized: false, // Accept self-signed certs to analyze them
        },
        (res) => {
          // Type assertion for TLS socket
          const socket = res.socket as tls.TLSSocket;
          const cert = socket.getPeerCertificate();

          if (!cert || Object.keys(cert).length === 0) {
            resolve(null);
            return;
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.floor(
            (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Helper function to safely get string from subject/issuer
          const getSubjectField = (field: string | string[] | undefined): string => {
            if (Array.isArray(field)) {
              return field[0] || 'unknown';
            }
            return field || 'unknown';
          };

          const sslInfo: SSLInfo = {
            version: '3', // TLS version (most modern certs use version 3)
            subject: getSubjectField(cert.subject?.CN) || getSubjectField(cert.subject?.O) || 'unknown',
            issuer: getSubjectField(cert.issuer?.CN) || getSubjectField(cert.issuer?.O) || 'unknown',
            valid_from: validFrom.toISOString(),
            valid_to: validTo.toISOString(),
            fingerprint: cert.fingerprint || 'unknown',
            is_valid: now >= validFrom && now <= validTo,
            days_remaining: daysRemaining,
          };

          res.destroy();
          resolve(sslInfo);
        }
      );

      req.on('error', (error) => {
        logger.error('Error fetching SSL certificate:', { hostname, error: String(error) });
        resolve(null);
      });

      req.on('timeout', () => {
        logger.warn('SSL certificate fetch timeout:', { hostname });
        req.destroy();
        resolve(null);
      });
    });
  } catch (error) {
    logger.error('Error getting SSL certificate info:', { url: urlString, error });
    return null;
  }
};

/**
 * Validate SSL certificate
 */
export const validateSSLCertificate = (
  sslInfo: SSLInfo | null
): { is_valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!sslInfo) {
    issues.push('No SSL certificate found or HTTPS not enabled');
    return { is_valid: false, issues };
  }

  if (!sslInfo.is_valid) {
    issues.push('SSL certificate is not valid');
  }

  if (sslInfo.days_remaining < 0) {
    issues.push('SSL certificate has expired');
  } else if (sslInfo.days_remaining < 7) {
    issues.push('SSL certificate will expire within 7 days');
  } else if (sslInfo.days_remaining < 30) {
    issues.push('SSL certificate will expire within 30 days');
  }

  return {
    is_valid: sslInfo.is_valid && sslInfo.days_remaining > 0,
    issues,
  };
};

/**
 * Check if domain uses HTTPS
 */
export const checkHTTPS = async (urlString: string): Promise<boolean> => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

export default {
  getSSLCertificateInfo,
  validateSSLCertificate,
  checkHTTPS,
};
