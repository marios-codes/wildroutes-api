import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Helmet middleware', () => {
  // Success, 404 (notFoundHandler) and 401 (appErrorHandler) take different paths
  // through the app, so each one must prove the headers are still present.
  it.each([
    { name: 'a successful response', path: '/health', status: 200 },
    { name: 'a 404 response', path: '/no-such-route', status: 404 },
    { name: 'a 401 response', path: '/bookings/me', status: 401 },
  ])('sets security headers on $name', async ({ path, status }) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(status);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
