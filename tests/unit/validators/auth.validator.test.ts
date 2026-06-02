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
