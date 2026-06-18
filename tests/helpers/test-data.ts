import request from 'supertest';
import app from '../../src/app';
import { AppError } from '../../src/utils/app-error';

export const createTestTour = async () => {
  const createTourPayload = {
    name: `Integration Test Tour ${Date.now()}`,
    duration: 2,
    difficulty: 'EASY',
    rating: 4.4,
    numberOfParticipants: 5,
  };

  const createTourResponse = await request(app).post('/tours').send(createTourPayload);

  return {
    createTourPayload,
    createTourResponse,
    createdTour: createTourResponse.body.data.tour,
    createdTourId: createTourResponse.body.data.tour.id,
  };
};

export const createTestUser = async () => {
  const createUserPayload = {
    name: `Integration Test User ${Date.now()}`,
    email: `user-${Date.now()}@test.com`,
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
