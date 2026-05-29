import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { TOUR_DIFFICULTIES } from '../../src/dtos/tours.dto';

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

      expect(first.createTourResponse.status).toBe(201);
      expect(second.createTourResponse.status).toBe(201);

      const response = await request(app).get('/tours?page=2&limit=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.tours[0].id).toBe(secondTourId);
    } finally {
      if (firstTourId !== undefined) {
        await request(app).delete(`/tours/${firstTourId}`);
      }

      if (secondTourId !== undefined) {
        await request(app).delete(`/tours/${secondTourId}`);
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
