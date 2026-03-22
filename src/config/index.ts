/**
 * Environment configuration and app settings
 */

import 'dotenv/config';

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  hibpApiKey?: string;
  apiVersion: string;
  logLevel: string;
}

/**
 * Load and validate environment variables
 */
const getConfig = (): AppConfig => {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    hibpApiKey: process.env.HIBP_API_KEY,
    apiVersion: '1.0.0',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};

export const config = getConfig();

export default config;
