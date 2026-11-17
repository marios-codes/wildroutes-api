import { describe, it, expect } from 'vitest';
import { parseRuntimeConfig } from '../../../src/config/env.parser';

const requiredEnvironment = {
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/wildroutes_test',
  JWT_SECRET: 'parser-test-secret-thirty-two-characters-long',
};

describe('parseRuntimeConfig', () => {
  it('returns the expected config shape for valid required settings', () => {
    expect(parseRuntimeConfig(requiredEnvironment)).toStrictEqual({
      databaseUrl: requiredEnvironment.DATABASE_URL,
      jwtSecret: requiredEnvironment.JWT_SECRET,
      port: 3000,
    });
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => parseRuntimeConfig({ JWT_SECRET: requiredEnvironment.JWT_SECRET })).toThrow(
      'Invalid environment configuration: DATABASE_URL: Invalid input: expected string, received undefined',
    );
  });

  it('rejects a missing JWT_SECRET', () => {
    expect(() => parseRuntimeConfig({ DATABASE_URL: requiredEnvironment.DATABASE_URL })).toThrow(
      'Invalid environment configuration: JWT_SECRET: Invalid input: expected string, received undefined',
    );
  });

  it('rejects a JWT_SECRET of 31 characters', () => {
    expect(() =>
      parseRuntimeConfig({ ...requiredEnvironment, JWT_SECRET: 'a'.repeat(31) }),
    ).toThrow(
      'Invalid environment configuration: JWT_SECRET: JWT_SECRET must be at least 32 characters long',
    );
  });

  it('accepts a JWT_SECRET of exactly 32 characters', () => {
    const secret = 'a'.repeat(32);

    expect(parseRuntimeConfig({ ...requiredEnvironment, JWT_SECRET: secret }).jwtSecret).toBe(
      secret,
    );
  });

  it('does not include a rejected JWT_SECRET in the error message', () => {
    const rejectedSecret = 'short-secret-marker';
    let message = '';

    try {
      parseRuntimeConfig({ ...requiredEnvironment, JWT_SECRET: rejectedSecret });
    } catch (error) {
      // The catch variable is `unknown`, so narrow it before reading .message.
      message = error instanceof Error ? error.message : '';
    }

    // Prove it threw for the right reason, otherwise the next check passes on an empty string.
    expect(message).toContain('JWT_SECRET must be at least 32 characters long');
    expect(message).not.toContain(rejectedSecret);
  });

  it('defaults PORT to 3000 when it is omitted', () => {
    expect(parseRuntimeConfig(requiredEnvironment).port).toBe(3000);
  });

  it('also accepts the postgres URL scheme', () => {
    const databaseUrl = 'postgres://postgres:password@localhost:5432/wildroutes_test';
    expect(
      parseRuntimeConfig({ ...requiredEnvironment, DATABASE_URL: databaseUrl }).databaseUrl,
    ).toBe(databaseUrl);
  });

  it.each([
    ['8080', 8080],
    ['1', 1],
    ['65535', 65535],
  ])('accepts PORT=%s as a number', (port, expected) => {
    expect(parseRuntimeConfig({ ...requiredEnvironment, PORT: port }).port).toBe(expected);
  });

  it.each(['0', '65536', 'not-a-number', '3000.5', ''])('rejects PORT=%s', (port) => {
    expect(() => parseRuntimeConfig({ ...requiredEnvironment, PORT: port })).toThrow(
      /^Invalid environment configuration: PORT: /,
    );
  });

  it('preserves the error for an unsupported database URL scheme', () => {
    expect(() =>
      parseRuntimeConfig({ ...requiredEnvironment, DATABASE_URL: 'https://example.com' }),
    ).toThrow(
      'Invalid environment configuration: DATABASE_URL: DATABASE_URL must be a PostgreSQL connection URL',
    );
  });

  it('rejects a malformed database URL', () => {
    expect(() => parseRuntimeConfig({ ...requiredEnvironment, DATABASE_URL: 'not-a-url' })).toThrow(
      /^Invalid environment configuration: DATABASE_URL: /,
    );
  });

  it('preserves the empty-secret error and joins multiple validation errors', () => {
    expect(() => parseRuntimeConfig({ ...requiredEnvironment, JWT_SECRET: '', PORT: '0' })).toThrow(
      'Invalid environment configuration: JWT_SECRET: JWT_SECRET must be at least 32 characters long; PORT: Too small: expected number to be >=1',
    );
  });

  it('does not mutate the supplied environment or expose unrelated settings', () => {
    const environment = Object.freeze({ ...requiredEnvironment, PORT: '8080', UNRELATED: 'value' });
    expect(parseRuntimeConfig(environment)).toStrictEqual({
      databaseUrl: requiredEnvironment.DATABASE_URL,
      jwtSecret: requiredEnvironment.JWT_SECRET,
      port: 8080,
    });
    expect(environment).toStrictEqual({ ...requiredEnvironment, PORT: '8080', UNRELATED: 'value' });
  });
});
