import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { verifyAuthToken } from '../utils/jwt';
import { getAuthenticatedUser } from '../services/auth.service';
import type { Role } from '../dtos/auth.dto';

export const authenticateUser = async (req: Request, _res: Response, next: NextFunction) => {
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

  // The token only proves identity. The role comes from the database so changes apply immediately.
  req.user = await getAuthenticatedUser(id);

  next();
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new AppError('Authorization required', 403);
    }

    next();
  };
};
