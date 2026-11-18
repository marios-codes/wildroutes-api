import { Buffer } from 'node:buffer';
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config/env';
import { signAuthToken, verifyAuthToken } from '../../../src/utils/jwt';

// Read the secret from the same config module the code uses, so the forged tokens
// below are signed with the real secret and only the algorithm differs.
const secret = config.jwtSecret;
const claims = { sub: '1' };

const base64UrlJson = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('verifyAuthToken', () => {
  it('accepts a token signed with HS256', () => {
    const token = jwt.sign(claims, secret, { algorithm: 'HS256', expiresIn: '1h' });

    expect(verifyAuthToken(token)).toMatchObject(claims);
  });

  it('rejects a token signed with HS512 using the correct secret', () => {
    const token = jwt.sign(claims, secret, { algorithm: 'HS512', expiresIn: '1h' });

    expect(() => verifyAuthToken(token)).toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Invalid or expired token' }),
    );
  });

  it('rejects an unsigned token that claims alg "none"', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = `${base64UrlJson({ alg: 'none', typ: 'JWT' })}.${base64UrlJson({ ...claims, exp })}.`;

    expect(() => verifyAuthToken(token)).toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Invalid or expired token' }),
    );
  });
});

describe('signAuthToken', () => {
  it('signs tokens with HS256', () => {
    const decoded = jwt.decode(signAuthToken(1), { complete: true });

    expect(decoded?.header.alg).toBe('HS256');
  });

  it('identifies the user by sub and carries no role claim', () => {
    const decoded = jwt.decode(signAuthToken(1), { complete: true });

    expect(decoded?.payload).toHaveProperty('sub', '1');
    expect(decoded?.payload).not.toHaveProperty('role');
  });
});
