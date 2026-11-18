import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { config } from '../../src/config/env';
import prisma from '../../src/config/prisma';
import { createTestAdminUser, createTestUser } from '../helpers/test-data';

// GET /bookings is admin-only, so it works as a probe for the caller's current role.
const ADMIN_ONLY_PATH = '/bookings';

describe('authentication reads the current user from the database, not from the token', () => {
  it('returns 403 when an admin is demoted after the token was issued', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const beforeDemotionResponse = await request(app)
        .get(ADMIN_ONLY_PATH)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(beforeDemotionResponse.status).toBe(200);

      await prisma.user.update({ where: { id: adminId }, data: { role: 'USER' } });

      const afterDemotionResponse = await request(app)
        .get(ADMIN_ONLY_PATH)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(afterDemotionResponse.status).toBe(403);
      expect(afterDemotionResponse.body).toHaveProperty('success', false);
      expect(afterDemotionResponse.body).toHaveProperty('message', 'Authorization required');
    } finally {
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });

  it('returns 403 when the token claims ADMIN but the database role is USER', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUserId: userId } = await createTestUser();
      createdUserId = userId;

      // Correctly signed with the real secret, but carrying a role claim that signAuthToken
      // no longer produces. The server must ignore it and use the database role (USER).
      const tokenClaimingAdmin = jwt.sign(
        { sub: String(userId), role: 'ADMIN' },
        config.jwtSecret,
        {
          algorithm: 'HS256',
          expiresIn: '1h',
        },
      );

      const response = await request(app)
        .get(ADMIN_ONLY_PATH)
        .set('Authorization', `Bearer ${tokenClaimingAdmin}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Authorization required');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });

  it('returns 401 when the user no longer exists', async () => {
    const { createdUserId, token } = await createTestUser();

    const beforeDeletionResponse = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(beforeDeletionResponse.status).toBe(200);

    const deleteCreatedUserResponse = await prisma.user.deleteMany({
      where: { id: createdUserId },
    });
    expect(deleteCreatedUserResponse.count).toBe(1);

    const afterDeletionResponse = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(afterDeletionResponse.status).toBe(401);
    expect(afterDeletionResponse.body).toHaveProperty('success', false);
    expect(afterDeletionResponse.body).toHaveProperty('message', 'Invalid or expired token');
  });
});
