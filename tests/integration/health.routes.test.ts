import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('returns server health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ message: 'Server is up and running' });
  });
});

describe('GET /health/ready', () => {
  it('returns ready when the database is available', async () => {
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ status: 'ready' });
  });
});
