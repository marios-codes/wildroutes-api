import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';
import { createTestAdminUser, createTestUser } from '../helpers/test-data';

describe('POST /categories', () => {
  it('creates a new category in the database', async () => {
    let createdCategoryId: number | undefined;
    let createdAdminId: number | undefined;
    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const name = `Integration Test Category ${Date.now()}`;

      const createCategoryPayload = {
        name,
      };

      const createCategoryResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryPayload);

      expect(createCategoryResponse.status).toBe(201);
      expect(createCategoryResponse.body).toHaveProperty('success', true);

      const createdCategory = createCategoryResponse.body.data.category;
      createdCategoryId = createdCategory.id;
      expect(createdCategory).toHaveProperty('id');
      expect(createdCategory).not.toHaveProperty('normalizedName');
      expect(createdCategory).toMatchObject(createCategoryPayload);
    } finally {
      if (createdCategoryId !== undefined) {
        const deleteCreatedCategoryResponse = await prisma.category.deleteMany({
          where: { id: createdCategoryId },
        });
        expect(deleteCreatedCategoryResponse.count).toBe(1);
      }
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when creating a category without a token', async () => {
    const name = `Integration Test Category ${Date.now()}`;

    const createCategoryPayload = {
      name,
    };

    const createCategoryResponse = await request(app)
      .post('/categories')
      .send(createCategoryPayload);

    expect(createCategoryResponse.status).toBe(401);
    expect(createCategoryResponse.body).toHaveProperty('success', false);
    expect(createCategoryResponse.body).toHaveProperty('message', 'Authentication required');
  });
  it('returns 403 when creating a category as a normal user', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const name = `Integration Test Category ${Date.now()}`;

      const createCategoryPayload = {
        name,
      };

      const createCategoryResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(createCategoryPayload);

      expect(createCategoryResponse.status).toBe(403);
      expect(createCategoryResponse.body).toHaveProperty('success', false);
      expect(createCategoryResponse.body).toHaveProperty('message', 'Authorization required');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when create body contains an unknown field', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;
      const name = `Integration Test Category ${Date.now()}`;

      const createCategoryPayload = {
        name,
        unexpectedField: true,
      };

      const createCategoryResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryPayload);
      expect(createCategoryResponse.status).toBe(400);
      expect(createCategoryResponse.body).toHaveProperty('success', false);
      expect(createCategoryResponse.body).toHaveProperty(
        'message',
        'Unrecognized key: "unexpectedField"',
      );
    } finally {
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 409 when creating duplicate category with different casing', async () => {
    let createdCategoryId: number | undefined;
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const name = `Integration Test Category ${Date.now()}`;
      const createCategoryPayload = {
        name,
      };

      const createCategoryResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryPayload);

      expect(createCategoryResponse.status).toBe(201);
      expect(createCategoryResponse.body).toHaveProperty('success', true);

      const createdCategory = createCategoryResponse.body.data.category;
      createdCategoryId = createdCategory.id;

      const createDuplicateCategoryPayload = {
        name: name.toLowerCase(),
      };

      const createDuplicateCategoryResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDuplicateCategoryPayload);

      expect(createDuplicateCategoryResponse.status).toBe(409);
      expect(createDuplicateCategoryResponse.body).toHaveProperty('success', false);
      expect(createDuplicateCategoryResponse.body).toHaveProperty(
        'message',
        'Category name already exists',
      );
    } finally {
      if (createdCategoryId !== undefined) {
        const deleteCreatedCategoryResponse = await prisma.category.deleteMany({
          where: { id: createdCategoryId },
        });
        expect(deleteCreatedCategoryResponse.count).toBe(1);
      }
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
});
