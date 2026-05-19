import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('GET /tours', () => {
  it('returns an array of tours', async () => {
    const response = await request(app).get('/tours');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data.tours)).toBe(true);
    expect(response.body.count).toBe(response.body.data.tours.length);
  });
});

describe('GET /tours/:id', () => {
  it('returns a tour by id from the tours list', async () => {
    const allToursResponse = await request(app).get('/tours');
    expect(allToursResponse.body.data.tours.length).toBeGreaterThan(0);
    const firstTourId = allToursResponse.body.data.tours[0].id;

    const firstTourResponse = await request(app).get(`/tours/${firstTourId}`);
    expect(firstTourResponse.status).toBe(200);
    expect(firstTourResponse.body).toHaveProperty('success', true);
    expect(firstTourResponse.body.data.tour.id).toBe(firstTourId);
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
    const { createTourPayload, createTourResponse, createdTour, createdTourId } =
      await createTestTour();

    expect(createTourResponse.status).toBe(201);
    expect(createTourResponse.body).toHaveProperty('success', true);
    expect(createdTour).toHaveProperty('id');
    expect(createdTour).toMatchObject(createTourPayload);

    const deleteCreatedTourResponse = await request(app).delete(`/tours/${createdTourId}`);
    expect(deleteCreatedTourResponse.status).toBe(200);
  });
  it('returns 400 when tour name is empty', async () => {
    const createTourPayload = {
      name: '',
      duration: 2,
      difficulty: 'EASY',
      rating: 4.4,
      numberOfParticipants: 5,
    };

    const response = await request(app).post('/tours').send(createTourPayload);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Tour name must be a non-empty string');
  });
});

describe('PATCH /tours/:id', () => {
  it('updates only provided fields for an existing tour', async () => {
    const { createTourPayload, createTourResponse, createdTourId } = await createTestTour();
    expect(createTourResponse.status).toBe(201);
    try {
      const updateTourResponse = await request(app)
        .patch(`/tours/${createdTourId}`)
        .send({ name: 'Updated Name' });

      expect(updateTourResponse.status).toBe(200);
      expect(updateTourResponse.body.data.tour.id).toBe(createdTourId);
      expect(updateTourResponse.body.data.tour.name).toBe('Updated Name');
      expect(updateTourResponse.body.data.tour.duration).toBe(createTourPayload.duration);
    } finally {
      const deleteCreatedTourResponse = await request(app).delete(`/tours/${createdTourId}`);
      expect(deleteCreatedTourResponse.status).toBe(200);
    }
  });
  it('returns 400 when tour body is empty', async () => {
    const updateTourResponse = await request(app).patch('/tours/99999999999').send({});
    expect(updateTourResponse.status).toBe(400);
    expect(updateTourResponse.body).toHaveProperty('success', false);
    expect(updateTourResponse.body).toHaveProperty(
      'message',
      'You must provide at least one tour field',
    );
  });
  it('returns 400 when request body has invalid field', async () => {
    const updateTourResponse = await request(app).patch('/tours/99999999999').send({
      price: 100,
    });
    expect(updateTourResponse.status).toBe(400);
    expect(updateTourResponse.body).toHaveProperty('success', false);
    expect(updateTourResponse.body).toHaveProperty('message', 'Invalid Fields: price');
  });
});

describe('DELETE /tours/:id', () => {
  it('deletes an existing tour', async () => {
    const { createTourResponse, createdTourId } = await createTestTour();
    expect(createTourResponse.status).toBe(201);

    const deleteCreatedTourResponse = await request(app).delete(`/tours/${createdTourId}`);
    expect(deleteCreatedTourResponse.status).toBe(200);
    expect(deleteCreatedTourResponse.body).toHaveProperty('success', true);

    const getDeletedTourResponse = await request(app).get(`/tours/${createdTourId}`);
    expect(getDeletedTourResponse.status).toBe(404);
    expect(getDeletedTourResponse.body).toHaveProperty('success', false);
    expect(getDeletedTourResponse.body).toHaveProperty('message', 'Tour not found');
  });
});

const createTestTour = async () => {
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
