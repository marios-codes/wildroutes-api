import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/prisma';
import { verifyAuthToken } from '../../src/utils/jwt';
import { createTestUser } from '../helpers/test-data';

describe('POST /auth/register', () => {
  it('returns 201 and safe user data', async () => {
    let createdUserId: number | undefined;
    try {
      const createUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: `register-success-${Date.now()}@test.com`,
        password: 'password',
      };

      const createUserResponse = await request(app).post('/auth/register').send(createUserPayload);

      expect(createUserResponse.status).toBe(201);

      const createdUser = createUserResponse.body.data.user;
      createdUserId = createdUser.id;
      const token = createUserResponse.body.data.token;
      const decodedToken = verifyAuthToken(token);

      expect(createUserResponse.body).toHaveProperty('success', true);
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.name).toBe(createUserPayload.name);
      expect(createdUser.email).toBe(createUserPayload.email);
      expect(createdUser.role).toBe('USER');
      expect(decodedToken.sub).toBe(String(createdUserId));
      expect(decodedToken.role).toBe('USER');
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
      const { createdUserId, createdUser } = await createTestUser();
      createdFirstUserId = createdUserId;

      const createSecondUserPayload = {
        name: `Integration Test User ${Date.now()}`,
        email: createdUser.email,
        password: 'password2',
      };

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
      const { createUserPayload, createdUser, createdUserId: userId } = await createTestUser();
      createdUserId = userId;

      const loginUserPayload = {
        email: createdUser.email,
        password: createUserPayload.password,
      };

      const loginResponse = await request(app).post('/auth/login').send(loginUserPayload);
      const loggedInUser = loginResponse.body.data.user;
      const token = loginResponse.body.data.token;
      const decodedToken = verifyAuthToken(token);

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loggedInUser.email).toBe(loginUserPayload.email);
      expect(decodedToken.sub).toBe(String(loggedInUser.id));
      expect(decodedToken.role).toBe('USER');
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
      const { createdUser, createdUserId: userId } = await createTestUser();
      createdUserId = userId;

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

describe('GET /auth/me', () => {
  it('returns 401 when authorization header is missing', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Authentication required');
  });
  it('returns 401 when token is invalid', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid or expired token');
  });
  it('returns current authenticated user identity', async () => {
    let createdUserId: number | undefined;

    try {
      const { createdUser, createdUserId: userId, token } = await createTestUser();
      createdUserId = userId;

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.id).toBe(createdUser.id);
      expect(response.body.data.user.role).toBe('USER');
    } finally {
      if (createdUserId !== undefined) {
        const deleteCreatedUserResponse = await prisma.user.deleteMany({
          where: { id: createdUserId },
        });

        expect(deleteCreatedUserResponse.count).toBe(1);
      }
    }
  });
});
