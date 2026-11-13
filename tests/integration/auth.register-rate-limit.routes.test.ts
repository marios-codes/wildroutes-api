import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';

// Kept in its own file: the limiter counts in process memory, so exhausting it
// here must not block the register tests in auth.routes.test.ts.
describe('POST /auth/register rate limiting', () => {
  it('counts every request, returns 429 with Retry-After on the 11th, and keeps login unaffected', async () => {
    const runId = Date.now();
    const createdEmails: string[] = [];
    const buildPayload = (index: number) => {
      const email = `register-limit-${runId}-${index}@test.com`;
      createdEmails.push(email);
      return { name: `Register Limit User ${index}`, email, password: 'password' };
    };

    try {
      // 3 successful registrations: successes must count towards the limit.
      for (let index = 1; index <= 3; index++) {
        const response = await request(app).post('/auth/register').send(buildPayload(index));
        expect(response.status).toBe(201);
      }

      // 7 invalid requests: failures count too (cheap, no bcrypt).
      for (let index = 1; index <= 7; index++) {
        const response = await request(app).post('/auth/register').send({});
        expect(response.status).toBe(400);
      }

      const limitedResponse = await request(app).post('/auth/register').send(buildPayload(11));

      expect(limitedResponse.status).toBe(429);
      expect(limitedResponse.body).toEqual({
        success: false,
        message: 'Too many registration attempts, please try again later',
      });
      expect(Number(limitedResponse.headers['retry-after'])).toBeGreaterThan(0);

      // Separate counters: an exhausted register limit must not limit login.
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'no-such-user@test.com', password: 'wrong-password' });
      expect(loginResponse.status).toBe(401);
    } finally {
      await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
    }
  });
});
