import { NextFunction, Request, Response } from 'express';

export const appErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
