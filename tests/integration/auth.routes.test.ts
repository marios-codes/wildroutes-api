import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';

describe('POST /auth/register', () => {
  it('returns 201 and safe user data', async () => {
    let createdUserId: number | undefined;
    try {
      const { createUserPayload, createUserResponse } = await createTestUser();

      expect(createUserResponse.status).toBe(201);

      const createdUser = createUserResponse.body.data.user;
      createdUserId = createdUser.id;

      expect(createUserResponse.body).toHaveProperty('success', true);
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.name).toBe(createUserPayload.name);
      expect(createdUser.email).toBe(createUserPayload.email);
      expect(createdUser.role).toBe('USER');
      expect(createdUser).not.toHaveProperty('password');
      expect(createdUser).not.toHaveProperty('passwordHash');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 409 when email is already in use', async () => {
    let createdFirstUserId: number | undefined;
    try {
      const duplicateEmail = `email-exists-${Date.now()}@test.com`;
      const createFirstUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: duplicateEmail,
        password: 'password',
      };

      const createSecondUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: duplicateEmail,
        password: 'password2',
      };

      const createFirstUserResponse = await request(app)
        .post('/auth/register')
        .send(createFirstUserPayload);

      expect(createFirstUserResponse.status).toBe(201);
      createdFirstUserId = createFirstUserResponse.body.data.user.id;

      const createSecondUserResponse = await request(app)
        .post('/auth/register')
        .send(createSecondUserPayload);

      expect(createSecondUserResponse.status).toBe(409);
      expect(createSecondUserResponse.body).toHaveProperty('success', false);
      expect(createSecondUserResponse.body).toHaveProperty('message', 'Email is already in use');
    } finally {
      if (createdFirstUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdFirstUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 400 when create body contains an unknown field', async () => {
    const createUserPayload = {
      name: `Integration Test User ${Date.now()}`,
      email: `unknown-field-${Date.now()}@test.com`,
      password: 'password',
      role: 'ADMIN',
    };

    const response = await request(app).post('/auth/register').send(createUserPayload);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Unrecognized key: "role"');
  });
});

describe('POST /auth/login', () => {
  it('returns 200 and safe user data', async () => {
    let createdUserId: number | undefined;
    try {
      const createUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: `login-success-${Date.now()}@test.com`,
        password: 'password',
      };

      const createdResponse = await request(app).post('/auth/register').send(createUserPayload);

      expect(createdResponse.status).toBe(201);

      const createdUser = createdResponse.body.data.user;
      createdUserId = createdUser.id;

      const loginUserPayload = {
        email: createdUser.email,
        password: createUserPayload.password,
      };

      const loginResponse = await request(app).post('/auth/login').send(loginUserPayload);
      const loggedInUser = loginResponse.body.data.user;

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loggedInUser.email).toBe(loginUserPayload.email);
      expect(loggedInUser).not.toHaveProperty('password');
      expect(loggedInUser).not.toHaveProperty('passwordHash');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when wrong password is provided', async () => {
    let createdUserId: number | undefined;
    try {
      const createUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: `wrong-password-${Date.now()}@test.com`,
        password: 'password',
      };

      const createdResponse = await request(app).post('/auth/register').send(createUserPayload);

      expect(createdResponse.status).toBe(201);

      const createdUser = createdResponse.body.data.user;
      createdUserId = createdUser.id;

      const loginUserPayload = {
        email: createdUser.email,
        password: 'wrongPassword',
      };

      const loginResponse = await request(app).post('/auth/login').send(loginUserPayload);

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.success).toBe(false);
      expect(loginResponse.body).toHaveProperty('message', 'Invalid email or password');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });
        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
  it('returns 401 when login with email that does not exist', async () => {
    const loginUserPayload = {
      email: 'non_existing_email@test.com',
      password: 'password',
    };

    const response = await request(app).post('/auth/login').send(loginUserPayload);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });
});

const createTestUser = async () => {
  const createUserPayload = {
    name: `Integration Test User ${Date.now()}`,
    email: `user-${Date.now()}@test.com`,
    password: 'password',
  };

  const createUserResponse = await request(app).post('/auth/register').send(createUserPayload);

  return {
    createUserPayload,
    createUserResponse,
  };
};
