import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Malformed JSON body', () => {
  it('returns 400 with the standard error body', async () => {
    // A string, not an object: supertest would serialise an object into valid JSON.
    const response = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@example.com", "password": ');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Invalid JSON' });
  });
});
