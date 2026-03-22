/**
 * Shared TypeScript interfaces and types for the Security Intelligence API
 */

export interface HealthCheckResponse {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
}

export interface SecurityHeaders {
  [key: string]: string | string[] | undefined;
}

export interface SSLInfo {
  version: string;
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  is_valid: boolean;
  days_remaining: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}
