const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('Auth Endpoints', () => {
  // Setup runs before any test
  beforeAll(() => {
    // Keep test logs clean
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should have a healthy root test endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('running');
  });

  it('should reject registration with empty data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    
    // Expecting an error code since no name/email is provided
    expect(res.statusCode).toBeGreaterThanOrEqual(400); 
  });
});
