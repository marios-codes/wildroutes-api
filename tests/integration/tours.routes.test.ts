import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';
import { TOUR_DIFFICULTIES } from '../../src/dtos/tours.dto';
import {
  createTestAdminUser,
  createTestReview,
  createTestTour,
  createTestUser,
} from '../helpers/test-data';

describe('GET /tours', () => {
  it('returns an array of tours', async () => {
    const response = await request(app).get('/tours');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data.tours)).toBe(true);
    expect(response.body.count).toBe(response.body.data.tours.length);
  });
  it('returns 200 when valid pagination query params are provided', async () => {
    const response = await request(app).get('/tours?page=2&limit=5');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data.tours)).toBe(true);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.pagination).toHaveProperty('totalItems', expect.any(Number));
    expect(response.body.pagination).toHaveProperty('totalPages', expect.any(Number));
  });
  it('returns at most one tour when limit is 1', async () => {
    const response = await request(app).get('/tours?limit=1');

    expect(response.status).toBe(200);
    expect(response.body.data.tours.length).toBeLessThanOrEqual(1);
    expect(response.body.count).toBe(response.body.data.tours.length);
  });
  it('returns 200 when valid difficulty is provided', async () => {
    const response = await request(app).get('/tours?difficulty=EASY');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.tours)).toBe(true);
    expect(response.body.pagination).toHaveProperty('totalItems', expect.any(Number));
    expect(
      response.body.data.tours.every((tour: { difficulty: string }) => tour.difficulty === 'EASY'),
    ).toBe(true);
  });
  it('returns the second tour when page is 2 and limit is 1', async () => {
    let firstTourId: number | undefined;
    let secondTourId: number | undefined;

    try {
      const first = await createTestTour();
      const second = await createTestTour();

      firstTourId = first.createdTourId;
      secondTourId = second.createdTourId;

      const expectedTours = await prisma.tour.findMany({
        skip: 1,
        take: 1,
        select: { id: true },
        orderBy: { id: 'asc' },
      });

      const response = await request(app).get('/tours?page=2&limit=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.tours).toHaveLength(expectedTours.length);
      expect(response.body.data.tours[0].id).toBe(expectedTours[0].id);
    } finally {
      const tourIds = [firstTourId, secondTourId].filter((id): id is number => id !== undefined);

      if (tourIds.length > 0) {
        await prisma.tour.deleteMany({
          where: { id: { in: tourIds } },
        });
      }
    }
  });
  it('returns 400 when page param is 0', async () => {
    const tourResponse = await request(app).get('/tours/?page=0');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'Page parameter must be a positive value');
  });
  it('returns 400 when limit param is not a number', async () => {
    const tourResponse = await request(app).get('/tours?limit=abc');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'Limit parameter should be of type number');
  });
  it('returns 400 when limit param is greater than 100', async () => {
    const tourResponse = await request(app).get('/tours?limit=101');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'Limit parameter cannot exceed 100');
  });
  it('returns 400 when unknown param is provided', async () => {
    const tourResponse = await request(app).get('/tours?price=100');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'Unrecognized key: "price"');
  });
  it('returns 400 when invalid difficulty param is provided', async () => {
    const tourResponse = await request(app).get('/tours?difficulty=EXTREME');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty(
      'message',
      `Tour difficulty must be one of: ${TOUR_DIFFICULTIES.join(', ')}`,
    );
  });
});

describe('GET /tours/:id', () => {
  it('returns a tour by id', async () => {
    let createdTourId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const response = await request(app).get(`/tours/${createdTourId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.tour.id).toBe(createdTourId);
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
    }
  });
  it('returns 404 and not found message when tour does not exist', async () => {
    const tourResponse = await request(app).get('/tours/999999');
    expect(tourResponse.status).toBe(404);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'Tour not found');
  });
  it('returns 400 when tour id is invalid', async () => {
    const tourResponse = await request(app).get('/tours/abc');
    expect(tourResponse.status).toBe(400);
    expect(tourResponse.body).toHaveProperty('success', false);
    expect(tourResponse.body).toHaveProperty('message', 'ID must be a positive integer');
  });
});

describe('POST /tours', () => {
  it('creates a new tour in the database', async () => {
    let createdTourId: number | undefined;
    let createdAdminId: number | undefined;
    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

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

      const createdTour = createTourResponse.body.data.tour;
      createdTourId = createdTour.id;

      expect(createTourResponse.status).toBe(201);
      expect(createTourResponse.body).toHaveProperty('success', true);
      expect(createdTour).toHaveProperty('id');
      expect(createdTour).toMatchObject(createTourPayload);
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when creating a tour without token', async () => {
    const createTourPayload = {
      name: 'Forest Canyon Trail',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.6,
      numberOfParticipants: 12,
    };

    const response = await request(app).post('/tours').send(createTourPayload);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Authentication required');
  });
  it('returns 403 when creating a tour as a normal user', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const createTourPayload = {
        name: 'Forest Canyon Trail',
        duration: 3,
        difficulty: 'EASY',
        rating: 4.6,
        numberOfParticipants: 12,
      };

      const response = await request(app)
        .post('/tours')
        .set('Authorization', `Bearer ${token}`)
        .send(createTourPayload);

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
  it('returns 400 when tour name is empty', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;
      const createTourPayload = {
        name: '',
        duration: 2,
        difficulty: 'EASY',
        rating: 4.4,
        numberOfParticipants: 5,
      };

      const response = await request(app)
        .post('/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTourPayload);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Tour name must be a non-empty string');
    } finally {
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when create body contains an unknown field', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;
      const createTourPayload = {
        name: 'Forest Canyon Trail',
        duration: 3,
        difficulty: 'EASY',
        rating: 4.6,
        numberOfParticipants: 12,
        price: 100,
      };

      const response = await request(app)
        .post('/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTourPayload);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    } finally {
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
});

describe('PATCH /tours/:id', () => {
  it('updates only provided fields for an existing tour', async () => {
    let createdTourId: number | undefined;
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const { createTourPayload, createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const updateTourResponse = await request(app)
        .patch(`/tours/${createdTourId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(updateTourResponse.status).toBe(200);
      expect(updateTourResponse.body.data.tour.id).toBe(createdTourId);
      expect(updateTourResponse.body.data.tour.name).toBe('Updated Name');
      expect(updateTourResponse.body.data.tour.duration).toBe(createTourPayload.duration);
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }

      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when updating a tour without token', async () => {
    const updateTourResponse = await request(app).patch('/tours/99999999999').send({
      name: 'Updated Name',
    });

    expect(updateTourResponse.status).toBe(401);
    expect(updateTourResponse.body).toHaveProperty('success', false);
    expect(updateTourResponse.body).toHaveProperty('message', 'Authentication required');
  });
  it('returns 403 when updating a tour as a normal user', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const updateTourResponse = await request(app)
        .patch('/tours/99999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(updateTourResponse.status).toBe(403);
      expect(updateTourResponse.body).toHaveProperty('success', false);
      expect(updateTourResponse.body).toHaveProperty('message', 'Authorization required');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when tour body is empty', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const updateTourResponse = await request(app)
        .patch('/tours/99999999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(updateTourResponse.status).toBe(400);
      expect(updateTourResponse.body).toHaveProperty('success', false);
      expect(updateTourResponse.body).toHaveProperty(
        'message',
        'You must provide at least one tour field',
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
  it('returns 400 when request body has invalid field', async () => {
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const updateTourResponse = await request(app)
        .patch('/tours/99999999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 100,
        });
      expect(updateTourResponse.status).toBe(400);
      expect(updateTourResponse.body).toHaveProperty('success', false);
      expect(updateTourResponse.body).toHaveProperty('message', 'Unrecognized key: "price"');
    } finally {
      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
});

describe('DELETE /tours/:id', () => {
  it('deletes an existing tour', async () => {
    let createdTourId: number | undefined;
    let createdAdminId: number | undefined;

    try {
      const { createdAdminId: adminId, adminToken } = await createTestAdminUser();
      createdAdminId = adminId;

      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const deleteCreatedTourResponse = await request(app)
        .delete(`/tours/${createdTourId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteCreatedTourResponse.status).toBe(200);
      expect(deleteCreatedTourResponse.body).toHaveProperty('success', true);

      createdTourId = undefined;

      const deletedTour = await prisma.tour.findUnique({
        where: { id: tourId },
      });
      expect(deletedTour).toBeNull();
    } finally {
      if (createdTourId !== undefined) {
        await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
      }

      if (createdAdminId !== undefined) {
        const deleteCreatedAdminResponse = await prisma.user.deleteMany({
          where: { id: createdAdminId },
        });
        expect(deleteCreatedAdminResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when deleting a tour without token', async () => {
    const deleteTourResponse = await request(app).delete('/tours/99999999999');

    expect(deleteTourResponse.status).toBe(401);
    expect(deleteTourResponse.body).toHaveProperty('success', false);
    expect(deleteTourResponse.body).toHaveProperty('message', 'Authentication required');
  });
  it('returns 403 when deleting a tour as a normal user', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const deleteTourResponse = await request(app)
        .delete('/tours/99999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(deleteTourResponse.status).toBe(403);
      expect(deleteTourResponse.body).toHaveProperty('success', false);
      expect(deleteTourResponse.body).toHaveProperty('message', 'Authorization required');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
});

describe('GET /tours/:tourId/reviews', () => {
  it('returns public paginated reviews for a tour', async () => {
    let createdTourId: number | undefined;
    const createdUserIds: number[] = [];
    const createdReviewIds: number[] = [];

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const firstUser = await createTestUser();
      const secondUser = await createTestUser();

      createdUserIds.push(firstUser.createdUserId, secondUser.createdUserId);

      const firstReview = await createTestReview(tourId, firstUser.createdUserId);
      const secondReview = await createTestReview(tourId, secondUser.createdUserId);

      createdReviewIds.push(firstReview.createdReviewId, secondReview.createdReviewId);

      const response = await request(app).get(`/tours/${tourId}/reviews?page=1&limit=1`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(1);
      expect(response.body.pagination).toStrictEqual({
        page: 1,
        limit: 1,
        totalItems: 2,
        totalPages: 2,
      });
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.reviews[0]).toMatchObject({
        id: createdReviewIds[0],
        userId: firstUser.createdUserId,
        tourId,
        rating: firstReview.createReviewPayload.rating,
        comment: firstReview.createReviewPayload.comment,
      });
    } finally {
      if (createdReviewIds.length > 0) {
        await prisma.review.deleteMany({
          where: { id: { in: createdReviewIds } },
        });
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
      }
    }
  });
  it('returns default pagination values when review query params are not provided', async () => {
    let createdTourId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const response = await request(app).get(`/tours/${tourId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(0);
      expect(response.body.pagination).toStrictEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      });
      expect(response.body.data.reviews).toStrictEqual([]);
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
    }
  });
  it('returns 404 when getting reviews for an unknown tour', async () => {
    const response = await request(app).get('/tours/999999/reviews');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Tour not found');
  });
  it('returns 400 when review query params are invalid', async () => {
    const response = await request(app).get('/tours/1/reviews?page=0');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Page parameter must be a positive value');
  });
  it('returns 400 when review route tour id is invalid', async () => {
    const response = await request(app).get('/tours/abc/reviews');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'ID must be a positive integer');
  });
});

describe('POST /tours/:tourId/reviews', () => {
  it('creates a new tour review in the database', async () => {
    let createdTourId: number | undefined;
    let createdUserId: number | undefined;
    let createdReviewId: number | undefined;
    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const createReviewPayload = {
        rating: 4,
        comment: `Integration Test Comment ${Date.now()}`,
      };

      const createReviewResponse = await request(app)
        .post(`/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send(createReviewPayload);

      expect(createReviewResponse.status).toBe(201);
      expect(createReviewResponse.body).toHaveProperty('success', true);

      const createdReview = createReviewResponse.body.data.review;
      createdReviewId = createdReview.id;

      expect(createReviewResponse.body.data.review.userId).toBe(createdUserId);
      expect(createReviewResponse.body.data.review.tourId).toBe(createdTourId);
      expect(createReviewPayload.comment).toBe(createdReview.comment);
      expect(createReviewPayload.rating).toBe(createdReview.rating);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when missing token', async () => {
    let createdTourId: number | undefined;
    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const createReviewPayload = { rating: 4, comment: `Integration Test Comment ${Date.now()}` };

      const createReviewResponse = await request(app)
        .post(`/tours/${tourId}/reviews`)
        .send(createReviewPayload);

      expect(createReviewResponse.status).toBe(401);
      expect(createReviewResponse.body).toHaveProperty('success', false);
      expect(createReviewResponse.body).toHaveProperty('message', 'Authentication required');
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when invalid body', async () => {
    let createdTourId: number | undefined;
    let createdUserId: number | undefined;
    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const createReviewPayload = {
        rating: 4,
        comment: `Integration Test Comment ${Date.now()}`,
        user: 'TestUser',
      };

      const createReviewResponse = await request(app)
        .post(`/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send(createReviewPayload);

      expect(createReviewResponse.status).toBe(400);
      expect(createReviewResponse.body).toHaveProperty('success', false);
      expect(createReviewResponse.body).toHaveProperty('message', 'Unrecognized key: "user"');
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 404 when unknown tour', async () => {
    let createdUserId: number | undefined;
    try {
      const createdTourId = 999999;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const createReviewPayload = {
        rating: 4,
        comment: `Integration Test Comment ${Date.now()}`,
      };

      const createReviewResponse = await request(app)
        .post(`/tours/${createdTourId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send(createReviewPayload);

      expect(createReviewResponse.status).toBe(404);
      expect(createReviewResponse.body).toHaveProperty('success', false);
      expect(createReviewResponse.body).toHaveProperty('message', 'Tour not found');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 409 when duplicate review by same user on same tour', async () => {
    let createdUserId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;
    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const { createdReviewId: reviewId } = await createTestReview(tourId, userId);
      createdReviewId = reviewId;

      const createSecondReviewPayload = {
        rating: 4,
        comment: `Integration Test Comment ${Date.now()}`,
      };

      const createSecondReviewResponse = await request(app)
        .post(`/tours/${createdTourId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send(createSecondReviewPayload);

      expect(createSecondReviewResponse.status).toBe(409);
      expect(createSecondReviewResponse.body).toHaveProperty('success', false);
      expect(createSecondReviewResponse.body).toHaveProperty(
        'message',
        'User must not have already reviewed this tour',
      );
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
});

describe('PATCH /tours/:tourId/reviews/:reviewId', () => {
  it('updates a review owned by the authenticated user', async () => {
    let createdUserId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const { createdReviewId: reviewId } = await createTestReview(tourId, userId);
      createdReviewId = reviewId;

      const updateReviewPayload = {
        rating: 5,
        comment: `Updated Integration Test Comment ${Date.now()}`,
      };

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateReviewPayload);

      expect(updateReviewResponse.status).toBe(200);
      expect(updateReviewResponse.body).toHaveProperty('success', true);
      expect(updateReviewResponse.body.data.review).toMatchObject({
        id: reviewId,
        userId: createdUserId,
        tourId: createdTourId,
        rating: updateReviewPayload.rating,
        comment: updateReviewPayload.comment,
      });

      const updatedReview = await prisma.review.findUnique({
        where: { id: createdReviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual(updateReviewPayload);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('updates only the rating when the review owner sends a partial update', async () => {
    let createdUserId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const { createReviewPayload, createdReviewId: reviewId } = await createTestReview(
        tourId,
        userId,
      );
      createdReviewId = reviewId;

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      expect(updateReviewResponse.status).toBe(200);

      const updatedReview = await prisma.review.findUnique({
        where: { id: reviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual({
        rating: 5,
        comment: createReviewPayload.comment,
      });
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 403 when a logged-in user updates another user review', async () => {
    let reviewOwnerId: number | undefined;
    let otherUserId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: ownerId } = await createTestUser();
      reviewOwnerId = ownerId;

      const { createdUserId: nonOwnerId, token: nonOwnerToken } = await createTestUser();
      otherUserId = nonOwnerId;

      expect(nonOwnerToken).toEqual(expect.any(String));
      expect(nonOwnerToken.length).toBeGreaterThan(20);

      const { createReviewPayload, createdReviewId: reviewId } = await createTestReview(
        tourId,
        ownerId,
      );
      createdReviewId = reviewId;

      const updateReviewPayload = {
        rating: 5,
        comment: `Updated Integration Test Comment ${Date.now()}`,
      };

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${nonOwnerToken}`)
        .send(updateReviewPayload);

      expect(updateReviewResponse.status).toBe(403);
      expect(updateReviewResponse.body).toHaveProperty('success', false);
      expect(updateReviewResponse.body).toHaveProperty(
        'message',
        'Review belongs to different user',
      );

      const updatedReview = await prisma.review.findUnique({
        where: { id: createdReviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual(createReviewPayload);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (reviewOwnerId !== undefined) {
        const deleteReviewOwnerResponse = await prisma.user.deleteMany({
          where: { id: reviewOwnerId },
        });
        expect(deleteReviewOwnerResponse.count).toBe(1);
      }
      if (otherUserId !== undefined) {
        const deleteOtherUserResponse = await prisma.user.deleteMany({
          where: { id: otherUserId },
        });
        expect(deleteOtherUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when an unauthenticated user updates a review', async () => {
    let reviewOwnerId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: ownerId } = await createTestUser();
      reviewOwnerId = ownerId;

      const { createReviewPayload, createdReviewId: reviewId } = await createTestReview(
        tourId,
        ownerId,
      );
      createdReviewId = reviewId;

      const updateReviewPayload = {
        rating: 5,
        comment: `Updated Integration Test Comment ${Date.now()}`,
      };

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${createdReviewId}`)
        .send(updateReviewPayload);

      expect(updateReviewResponse.status).toBe(401);
      expect(updateReviewResponse.body).toHaveProperty('success', false);
      expect(updateReviewResponse.body).toHaveProperty('message', 'Authentication required');

      const updatedReview = await prisma.review.findUnique({
        where: { id: createdReviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual(createReviewPayload);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (reviewOwnerId !== undefined) {
        const deleteReviewOwnerResponse = await prisma.user.deleteMany({
          where: { id: reviewOwnerId },
        });
        expect(deleteReviewOwnerResponse.count).toBe(1);
      }
    }
  });
  it('returns 404 when updating an unknown review', async () => {
    let createdUserId: number | undefined;
    let createdTourId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const { createdReviewId: unknownReviewId } = await createTestReview(tourId, userId);

      await prisma.review.delete({
        where: {
          id: unknownReviewId,
        },
      });

      const updateReviewPayload = {
        rating: 5,
        comment: `Updated Integration Test Comment ${Date.now()}`,
      };

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${unknownReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateReviewPayload);

      expect(updateReviewResponse.status).toBe(404);
      expect(updateReviewResponse.body).toHaveProperty('success', false);
      expect(updateReviewResponse.body).toHaveProperty('message', 'Review not found');
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 404 when updating a review that belongs to a different tour', async () => {
    let createdUserId: number | undefined;
    let createdTourAId: number | undefined;
    let createdTourBId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourAId } = await createTestTour();
      createdTourAId = tourAId;

      const { createdTourId: tourBId } = await createTestTour();
      createdTourBId = tourBId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const { createReviewPayload, createdReviewId: reviewId } = await createTestReview(
        tourAId,
        userId,
      );
      createdReviewId = reviewId;

      const updateReviewPayload = {
        rating: 5,
        comment: `Updated Integration Test Comment ${Date.now()}`,
      };

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourBId}/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateReviewPayload);

      expect(updateReviewResponse.status).toBe(404);
      expect(updateReviewResponse.body).toHaveProperty('success', false);
      expect(updateReviewResponse.body).toHaveProperty(
        'message',
        'Review belongs to different tour',
      );

      const updatedReview = await prisma.review.findUnique({
        where: { id: createdReviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual(createReviewPayload);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourAId !== undefined) {
        const deleteCreatedTourAResponse = await prisma.tour.deleteMany({
          where: { id: createdTourAId },
        });
        expect(deleteCreatedTourAResponse.count).toBe(1);
      }
      if (createdTourBId !== undefined) {
        const deleteCreatedTourBResponse = await prisma.tour.deleteMany({
          where: { id: createdTourBId },
        });
        expect(deleteCreatedTourBResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when updating with empty body', async () => {
    let createdUserId: number | undefined;
    let createdTourId: number | undefined;
    let createdReviewId: number | undefined;

    try {
      const { createdTourId: tourId } = await createTestTour();
      createdTourId = tourId;

      const { createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(20);

      const { createReviewPayload, createdReviewId: reviewId } = await createTestReview(
        tourId,
        userId,
      );
      createdReviewId = reviewId;

      const updateReviewResponse = await request(app)
        .patch(`/tours/${tourId}/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(updateReviewResponse.status).toBe(400);
      expect(updateReviewResponse.body).toHaveProperty('success', false);
      expect(updateReviewResponse.body).toHaveProperty(
        'message',
        'You must provide at least one review field',
      );

      const updatedReview = await prisma.review.findUnique({
        where: { id: createdReviewId },
        select: {
          rating: true,
          comment: true,
        },
      });

      expect(updatedReview).toStrictEqual(createReviewPayload);
    } finally {
      if (createdReviewId !== undefined) {
        const deleteCreatedReviewResponse = await prisma.review.deleteMany({
          where: { id: createdReviewId },
        });
        expect(deleteCreatedReviewResponse.count).toBe(1);
      }
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await prisma.tour.deleteMany({
          where: { id: createdTourId },
        });
        expect(deleteCreatedTourResponse.count).toBe(1);
      }
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
});
