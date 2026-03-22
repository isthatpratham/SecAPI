/**
 * Response types for all API endpoints
 */

import { SecurityHeaders, SSLInfo, RiskAssessment, Recommendation } from './index';

/**
 * Base API response wrapper for all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * URL Scan response data
 */
export interface URLScanData {
  url: string;
  headers: SecurityHeaders;
  ssl: SSLInfo | null;
  riskScore: RiskAssessment;
  recommendations: Recommendation[];
  responseTime: number;
}

/**
 * Domain Check response data
 */
export interface DomainCheckData {
  domain: string;
  is_registered: boolean;
  phishing_score: number;
  typosquatting_risk: boolean;
  age_days?: number;
  riskScore: RiskAssessment;
  recommendations: Recommendation[];
}

/**
 * Password Check response data
 */
export interface PasswordStrengthData {
  password_length: number;
  entropy: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  has_uppercase: boolean;
  has_lowercase: boolean;
  has_numbers: boolean;
  has_special_chars: boolean;
  common_word: boolean;
  crack_time_seconds: number;
  riskScore: RiskAssessment;
  recommendations: Recommendation[];
}

/**
 * Email Breach response data
 */
export interface BreachCheckData {
  email: string;
  breached: boolean;
  breach_count?: number;
  breaches?: {
    name: string;
    date: string;
    data_classes: string[];
  }[];
  riskScore: RiskAssessment;
  recommendations: Recommendation[];
}

/**
 * Typed response types
 */
export type URLScanResponse = ApiResponse<URLScanData>;
export type DomainCheckResponse = ApiResponse<DomainCheckData>;
export type PasswordStrengthResponse = ApiResponse<PasswordStrengthData>;
export type BreachCheckResponse = ApiResponse<BreachCheckData>;
export type HealthCheckResponse = ApiResponse<{
  status: 'ok';
  uptime: number;
  version: string;
}>;
