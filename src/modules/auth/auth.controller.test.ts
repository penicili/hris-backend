import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { app } from '../../app.js';
import prisma from '../../lib/prisma.js';

const testEmail = `auth-test-${Date.now()}@example.com`;
const testPassword = 'password123';

describe('auth API', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('registers a user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Auth Test User',
      email: testEmail,
      password: testPassword
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: testEmail,
      name: 'Auth Test User'
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: testEmail,
      password: testPassword
    });

    expect(response.status).toBe(409);
  });

  it('logs in a registered user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });
});
