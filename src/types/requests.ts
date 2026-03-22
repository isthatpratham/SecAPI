/**
 * Request body types for API endpoints
 */

export interface URLScanRequest {
  url: string;
}

export interface DomainCheckRequest {
  domain: string;
}

export interface PasswordCheckRequest {
  password: string;
}

export interface EmailBreachRequest {
  email: string;
}
