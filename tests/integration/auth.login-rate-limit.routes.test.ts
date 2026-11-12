import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';
import { createTestUser } from '../helpers/test-data';

// Kept in its own file: the limiter counts in process memory, so exhausting it
// here must not block the login tests in auth.routes.test.ts.
// The tests share one counter and run in order: the second one exhausts it.
describe('POST /auth/login rate limiting', () => {
  it('does not count successful logins towards the limit', async () => {
    let createdUserId: number | undefined;
    try {
      const { createUserPayload, createdUser, createdUserId: userId } = await createTestUser();
      createdUserId = userId;
      const validLogin = { email: createdUser.email, password: createUserPayload.password };

      for (let attempt = 1; attempt <= 12; attempt++) {
        const response = await request(app).post('/auth/login').send(validLogin);
        expect(response.status).toBe(200);
      }
    } finally {
      if (createdUserId !== undefined) {
        await prisma.user.deleteMany({ where: { id: createdUserId } });
      }
    }
  });

  it('returns 429 with Retry-After after 10 failed attempts, without affecting other routes', async () => {
    const wrongLogin = { email: 'no-such-user@test.com', password: 'wrong-password' };

    for (let attempt = 1; attempt <= 10; attempt++) {
      const response = await request(app).post('/auth/login').send(wrongLogin);
      expect(response.status).toBe(401);
    }

    const limitedResponse = await request(app).post('/auth/login').send(wrongLogin);

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toEqual({
      success: false,
      message: 'Too many login attempts, please try again later',
    });
    expect(Number(limitedResponse.headers['retry-after'])).toBeGreaterThan(0);

    const unrelatedResponse = await request(app).get('/tours');
    expect(unrelatedResponse.status).toBe(200);
  });
});
