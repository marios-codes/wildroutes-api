import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { AuthTokenPayload } from '../dtos/auth.dto';
import { AppError } from './app-error';

const jwtSecret = config.jwtSecret;
const JWT_EXPIRES_IN = '1h';

// The token only proves identity (sub). The role is deliberately not included: it is read from
// the database on every request, so a copy inside the token could only ever be stale.
export const signAuthToken = (userId: number): string => {
  return jwt.sign({ sub: String(userId) }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
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
