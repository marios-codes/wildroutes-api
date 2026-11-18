import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

// The limit is 16 KB (16,384 bytes). Sizes are chosen on either side of it, and the oversized
// one is below the 100 KB library default so removing the explicit limit makes the test fail.
describe('JSON body size limit', () => {
  it('accepts undersized JSON bodies', async () => {
    // About 15 KB: past the body parser, then rejected by validation (400), not by the size limit.
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'x'.repeat(15_000),
      });

    expect(response.status).not.toBe(413);
  });

  it('rejects oversized JSON bodies', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'x'.repeat(20_000),
      });

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('Request body too large');
  });
});
