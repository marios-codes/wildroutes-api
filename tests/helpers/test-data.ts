import bcrypt from 'bcrypt';
import { signAuthToken } from '../../src/utils/jwt';
import prisma from '../../src/config/prisma';

const BCRYPT_SALT_ROUNDS = 10;

export const createTestTour = async () => {
  const createTourPayload = {
    name: `Integration Test Tour ${Date.now()}`,
    duration: 2,
    difficulty: 'EASY',
    rating: 4.4,
    numberOfParticipants: 5,
  } as const;

  const createdTour = await prisma.tour.create({
    data: createTourPayload,
    select: {
      id: true,
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
  });

  return {
    createTourPayload,
    createdTour,
    createdTourId: createdTour.id,
  };
};

export const createTestUser = async () => {
  const password = 'password';
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createUserPayload = {
    name: `Integration Test User ${uniqueSuffix}`,
    email: `user-${uniqueSuffix}@test.com`,
    password,
  };

  const createdUser = await prisma.user.create({
    data: {
      name: createUserPayload.name,
      email: createUserPayload.email,
      passwordHash,
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = signAuthToken(createdUser.id, createdUser.role);

  return {
    createUserPayload,
    createdUser,
    createdUserId: createdUser.id,
    token,
  };
};

export const createTestAdminUser = async () => {
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

export const createTestReview = async (tourId: number, userId: number) => {
  const createReviewPayload = {
    rating: 4,
    comment: `Integration Test Comment ${Date.now()}`,
  };

  const createdReview = await prisma.review.create({
    data: {
      ...createReviewPayload,
      tourId,
      userId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,
      tourId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    createReviewPayload,
    createdReview,
    createdReviewId: createdReview.id,
  };
};
