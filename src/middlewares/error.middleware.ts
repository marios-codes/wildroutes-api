import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import logger from '../config/logger';

export const appErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  logger.error(
    { errorName: error.name, requestId: res.locals.requestId },
    'Unexpected request failure',
  );
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
