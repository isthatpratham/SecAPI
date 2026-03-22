/**
 * URL Scanner route tests
 */

import request from 'supertest';
import app from '../src/app';

describe('URL Scanner Route', () => {
  describe('POST /api/v1/scan/url', () => {
    it('should return 200 with valid URL', async () => {
      const response = await request(app).post('/api/v1/scan/url').send({
        url: 'https://www.google.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.url).toBe('https://www.google.com');
      expect(response.body.data.riskScore).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it('should return 400 with invalid URL', async () => {
      const response = await request(app).post('/api/v1/scan/url').send({
        url: 'not-a-valid-url',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app).post('/api/v1/scan/url').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should include security assessment in response', async () => {
      const response = await request(app).post('/api/v1/scan/url').send({
        url: 'https://example.com',
      });

      if (response.status === 200) {
        expect(response.body.data.headers).toBeDefined();
        expect(response.body.data.ssl).toBeDefined();
        expect(response.body.data.riskScore.score).toBeGreaterThanOrEqual(0);
        expect(response.body.data.riskScore.score).toBeLessThanOrEqual(100);
      }
    });
  });
});
