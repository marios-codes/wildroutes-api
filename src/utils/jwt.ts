import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { Role, AuthTokenPayload } from '../dtos/auth.dto';
import { AppError } from './app-error';

const jwtSecret = config.jwtSecret;
const JWT_EXPIRES_IN = '1h';

export const signAuthToken = (userId: number, role: Role): string => {
  return jwt.sign(
    {
      sub: String(userId),
      role,
    },
    jwtSecret,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN },
  );
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
    }) as AuthTokenPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
