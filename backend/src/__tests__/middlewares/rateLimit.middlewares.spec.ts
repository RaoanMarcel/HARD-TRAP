import request from 'supertest';
import express from 'express';
import { loginLimiter, forgotPasswordLimiter } from '../../middlewares/rateLimiter';
import { describe, it, expect } from 'vitest';

const app = express();
app.use(express.json());

app.post('/login', loginLimiter, (req, res) => {
  res.status(200).send('Login OK');
});

app.post('/forgot-password', forgotPasswordLimiter, (req, res) => {
  res.status(200).send('Forgot Password OK');
});

describe('Rate Limiting Middleware', () => {
  it('should allow requests within the limit for /login', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/login');
      expect(res.status).toBe(200);
    }
  });

  it('should block requests exceeding the limit for /login', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/login');
    }
    const res = await request(app).post('/login');
    expect(res.status).toBe(429);
  });

  it('should allow requests within the limit for /forgot-password', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/forgot-password');
      expect(res.status).toBe(200);
    }
  });

  it('should block requests exceeding the limit for /forgot-password', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/forgot-password');
    }
    const res = await request(app).post('/forgot-password');
    expect(res.status).toBe(429);
  });
});