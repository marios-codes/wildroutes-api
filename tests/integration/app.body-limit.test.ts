import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('JSON body size limit', () => {
  it('accepts undersized JSON bodies', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'x'.repeat(40_000),
      });

    expect(response.status).not.toBe(413);
  });

  it('rejects oversized JSON bodies', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'x'.repeat(70_000),
      });

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('Request body too large');
  });
});
