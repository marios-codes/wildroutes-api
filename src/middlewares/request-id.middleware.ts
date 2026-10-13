import { randomUUID } from 'node:crypto';
import { RequestHandler } from 'express';

export const requestIdHandler: RequestHandler = (_req, res, next) => {
  const requestId = randomUUID();

  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};
