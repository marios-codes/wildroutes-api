import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import healthRouter from '../../../src/routes/health.routes';
import { getReadiness } from '../../../src/services/health.service';

vi.mock('../../../src/services/health.service');

const app = express();
app.use('/health', healthRouter);

describe('GET /health/ready', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 503 when the service reports not_ready', async () => {
    vi.mocked(getReadiness).mockResolvedValue({ status: 'not_ready' });

    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toStrictEqual({ status: 'not_ready' });
    expect(getReadiness).toHaveBeenCalledOnce();
  });
});
