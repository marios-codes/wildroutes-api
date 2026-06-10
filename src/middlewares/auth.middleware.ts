import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { verifyAuthToken } from '../utils/jwt';

export const authenticateUser = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authorizationHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  const decodedToken = verifyAuthToken(token);

  const id = Number(decodedToken.sub);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid or expired token', 401);
  }

  const role = decodedToken.role;

  req.user = { id, role };

  next();
};
