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
  it('returns a tour by id', async () => {
    const { createTourResponse, createdTourId } = await createTestTour();

    expect(createTourResponse.status).toBe(201);

    try {
      const response = await request(app).get(`/tours/${createdTourId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.tour.id).toBe(createdTourId);
    } finally {
      const deleteCreatedTourResponse = await request(app).delete(`/tours/${createdTourId}`);
      expect(deleteCreatedTourResponse.status).toBe(200);
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
    try {
      const {
        createTourPayload,
        createTourResponse,
        createdTour,
        createdTourId: id,
      } = await createTestTour();

      createdTourId = id;

      expect(createTourResponse.status).toBe(201);
      expect(createTourResponse.body).toHaveProperty('success', true);
      expect(createdTour).toHaveProperty('id');
      expect(createdTour).toMatchObject(createTourPayload);
    } finally {
      if (createdTourId !== undefined) {
        const deleteCreatedTourResponse = await request(app).delete(`/tours/${createdTourId}`);
        expect(deleteCreatedTourResponse.status).toBe(200);
      }
    }
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
  it('returns 400 when create body contains an unknown field', async () => {
    const createTourPayload = {
      name: 'Forest Canyon Trail',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.6,
      numberOfParticipants: 12,
      price: 100,
    };

    const response = await request(app).post('/tours').send(createTourPayload);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
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
    expect(updateTourResponse.body).toHaveProperty('message', 'Unrecognized key: "price"');
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
