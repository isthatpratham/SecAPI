/**
 * Password analyzer tests
 */

import request from 'supertest';
import app from '../src/app';
import { analyzePassword, isCommonPassword } from '../src/services/passwordAnalyzer';

describe('Password Analyzer', () => {
  describe('Analysis Functions', () => {
    it('should identify common passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('MySecureP@ss123')).toBe(false);
    });

    it('should analyze password strength', () => {
      const weak = analyzePassword('pass');
      const strong = analyzePassword('MySecureP@ss123!');

      expect(weak.strength).toBe('weak');
      expect(strong.strength).not.toBe('weak');
      expect(strong.score).toBeGreaterThan(weak.score);
    });

    it('should calculate password entropy', () => {
      const analysis = analyzePassword('P@ssw0rd!');
      expect(analysis.entropy).toBeGreaterThan(0);
    });

    it('should detect password issues', () => {
      const weak = analyzePassword('abc');
      expect(weak.issues.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/check/password', () => {
    it('should return 200 with password analysis', async () => {
      const response = await request(app).post('/api/v1/check/password').send({
        password: 'MySecureP@ss123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.strength).toBeDefined();
      expect(response.body.data.riskScore).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/v1/check/password').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should analyze weak password', async () => {
      const response = await request(app).post('/api/v1/check/password').send({
        password: 'pass',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.strength).toBe('weak');
    });

    it('should analyze strong password', async () => {
      const response = await request(app).post('/api/v1/check/password').send({
        password: 'Tr0ub4dor&3xGT#@!',
      });

      expect(response.status).toBe(200);
      expect(['strong', 'very_strong']).toContain(response.body.data.strength);
    });
  });
});
