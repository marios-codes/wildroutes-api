import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import { signAuthToken } from '../../src/utils/jwt';
import prisma from '../../src/config/prisma';

export const createTestTour = async (adminToken: string) => {
  const createTourPayload = {
    name: `Integration Test Tour ${Date.now()}`,
    duration: 2,
    difficulty: 'EASY',
    rating: 4.4,
    numberOfParticipants: 5,
  };

  const createTourResponse = await request(app)
    .post('/tours')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(createTourPayload);

  return {
    createTourPayload,
    createTourResponse,
    createdTour: createTourResponse.body.data?.tour,
    createdTourId: createTourResponse.body.data?.tour?.id,
  };
};

export const createTestUser = async () => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createUserPayload = {
    name: `Integration Test User ${uniqueSuffix}`,
    email: `user-${uniqueSuffix}@test.com`,
    password: 'password',
  };

  const createUserResponse = await request(app).post('/auth/register').send(createUserPayload);

  return {
    createUserPayload,
    createUserResponse,
    createdUser: createUserResponse.body.data.user,
    createdUserId: createUserResponse.body.data.user.id,
  };
};

export const createTestAdminUser = async () => {
  const BCRYPT_SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash('12345678', BCRYPT_SALT_ROUNDS);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const admin = await prisma.user.create({
    data: {
      name: `Integration Test Admin ${uniqueSuffix}`,
      email: `admin-${uniqueSuffix}@test.com`,
      passwordHash,
      role: 'ADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = signAuthToken(admin.id, admin.role);

  return {
    createdAdmin: admin,
    createdAdminId: admin.id,
    adminToken: token,
  };
};

export const createTestReview = async (tourId: number, token: string) => {
  const createReviewPayload = {
    rating: 4,
    comment: `Integration Test Comment ${Date.now()}`,
  };

  const createReviewResponse = await request(app)
    .post(`/tours/${tourId}/reviews`)
    .set('Authorization', `Bearer ${token}`)
    .send(createReviewPayload);

  return {
    createReviewPayload,
    createReviewResponse,
  };
};
