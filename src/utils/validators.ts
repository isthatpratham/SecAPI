/**
 * Input validation helpers using Zod
 */

import { z } from 'zod';

/**
 * URL validation schema
 */
export const URLSchema = z.object({
  url: z.string().url('Invalid URL format').min(1, 'URL is required'),
});

/**
 * Domain validation schema
 */
export const DomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(/^[\w\-.]+\.\w+$/, 'Invalid domain format'),
});

/**
 * Password validation schema
 */
export const PasswordSchema = z.object({
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

/**
 * Email validation schema
 */
export const EmailSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
});

/**
 * Generic validation function
 */
export const validateRequest = async <T>(
  schema: z.ZodSchema,
  data: unknown
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Validation failed' };
  }
};

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a string is a valid domain
 */
export const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
};

/**
 * Check if a string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
