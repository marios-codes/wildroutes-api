import { describe, it, expect } from 'vitest';
import {
  validateRegisterUserBody,
  validateLoginUserBody,
} from '../../../src/validators/auth.validator';

describe('validateRegisterUserBody', () => {
  it('returns a RegisterUserDto for a valid body', () => {
    expect(
      validateRegisterUserBody({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password',
      }),
    ).toStrictEqual({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('trims whitespace from user name', () => {
    expect(
      validateRegisterUserBody({
        name: 'Test User  ',
        email: 'user@test.com',
        password: 'password',
      }),
    ).toStrictEqual({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('trims a valid email address', () => {
    expect(
      validateRegisterUserBody({
        name: 'Test User',
        email: ' user@test.com',
        password: 'password',
      }),
    ).toStrictEqual({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('lowercases a valid email address', () => {
    expect(
      validateRegisterUserBody({
        name: 'Test User',
        email: 'USER@test.cOm',
        password: 'password',
      }),
    ).toStrictEqual({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('throws when name is an empty string', () => {
    expect(() =>
      validateRegisterUserBody({
        name: '',
        email: 'user@test.com',
        password: 'password',
      }),
    ).toThrow('User name must be a non-empty string');
  });
  it('throws when invalid email is provided', () => {
    expect(() =>
      validateRegisterUserBody({
        name: 'Test User',
        email: 'user@test',
        password: 'password',
      }),
    ).toThrow('User email is not valid');
  });
  it('throws when short user password is provided', () => {
    expect(() =>
      validateRegisterUserBody({
        name: 'Test User',
        email: 'user@test.com',
        password: 'pass',
      }),
    ).toThrow('User password must be at least 8 characters');
  });
  it('throws when unknown user field is provided', () => {
    expect(() =>
      validateRegisterUserBody({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password',
        role: 'ADMIN',
      }),
    ).toThrow();
  });
});

describe('validateLoginUserBody', () => {
  it('returns a LoginUserDto for a valid body', () => {
    expect(
      validateLoginUserBody({
        email: 'user@test.com',
        password: 'password',
      }),
    ).toStrictEqual({
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('lowercases a valid email address', () => {
    expect(
      validateLoginUserBody({
        email: 'USER@test.cOm',
        password: 'password',
      }),
    ).toStrictEqual({
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('trims a valid email address', () => {
    expect(
      validateLoginUserBody({
        email: ' user@test.com',
        password: 'password',
      }),
    ).toStrictEqual({
      email: 'user@test.com',
      password: 'password',
    });
  });
  it('throws when invalid email is provided', () => {
    expect(() =>
      validateLoginUserBody({
        email: 'user@test',
        password: 'password',
      }),
    ).toThrow('User email is not valid');
  });
  it('throws when user password is empty', () => {
    expect(() =>
      validateLoginUserBody({
        email: 'user@test.com',
        password: '',
      }),
    ).toThrow('User password cannot be empty');
  });
  it('throws when unknown user field is provided', () => {
    expect(() =>
      validateLoginUserBody({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password',
      }),
    ).toThrow();
  });
});

describe('auth field length limits', () => {
  const validRegistration = { name: 'Test User', email: 'user@test.com', password: 'password' };
  // '@example.com' is 12 characters, so the local part supplies the rest of the length.
  const emailOfLength = (length: number) => `${'a'.repeat(length - 12)}@example.com`;

  it('accepts a name of 100 characters and rejects 101', () => {
    expect(validateRegisterUserBody({ ...validRegistration, name: 'a'.repeat(100) }).name).toBe(
      'a'.repeat(100),
    );
    expect(() => validateRegisterUserBody({ ...validRegistration, name: 'a'.repeat(101) })).toThrow(
      'User name cannot exceed 100 characters',
    );
  });

  it('accepts an email of 254 characters and rejects 255', () => {
    const accepted = validateRegisterUserBody({
      ...validRegistration,
      email: emailOfLength(254),
    });

    expect(accepted.email).toBe(emailOfLength(254));
    expect(() =>
      validateRegisterUserBody({ ...validRegistration, email: emailOfLength(255) }),
    ).toThrow('User email cannot exceed 254 characters');
  });

  it('accepts a password of 72 characters and rejects 73 on register and login', () => {
    const message = 'User password cannot exceed 72 characters';

    expect(
      validateRegisterUserBody({ ...validRegistration, password: 'a'.repeat(72) }).password,
    ).toBe('a'.repeat(72));
    expect(() =>
      validateRegisterUserBody({ ...validRegistration, password: 'a'.repeat(73) }),
    ).toThrow(message);
    expect(
      validateLoginUserBody({ email: 'user@test.com', password: 'a'.repeat(72) }).password,
    ).toBe('a'.repeat(72));
    expect(() =>
      validateLoginUserBody({ email: 'user@test.com', password: 'a'.repeat(73) }),
    ).toThrow(message);
  });
});
