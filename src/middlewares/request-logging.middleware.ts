import type { RequestHandler } from 'express';
import logger from '../config/logger';

export const requestLoggerHandler: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(
      {
        requestId: res.locals.requestId,
        method: req.method,
        route: req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched',
        statusCode: res.statusCode,
        durationMs,
      },
      'Request completed',
    );
  });

  next();
};
