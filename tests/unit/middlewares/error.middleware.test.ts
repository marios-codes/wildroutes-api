import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import logger from '../../../src/config/logger';
import { appErrorHandler } from '../../../src/middlewares/error.middleware';

vi.mock('../../../src/config/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('appErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs safe error context and returns a generic 500 for unexpected errors', () => {
    const requestId = 'request-123';
    const status = vi.fn();
    const json = vi.fn();
    const response = {
      locals: { requestId },
      status,
      json,
    } as unknown as Response;

    status.mockReturnValue(response);

    const error = new Error('Sensitive internal detail');

    appErrorHandler(error, {} as Request, response, vi.fn() as NextFunction);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
    expect(logger.error).toHaveBeenCalledExactlyOnceWith(
      { errorName: 'Error', requestId },
      'Unexpected request failure',
    );
  });
});
