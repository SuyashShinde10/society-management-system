import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../../server';
import User from '../../models/User';
import Society from '../../models/Society';

describe('Auth Cookie Flow & Security Guards Integration', () => {
  let testSociety: any;
  let testUser: any;
  const rawPassword = 'Password123!';

  beforeEach(async () => {
    testSociety = await Society.create({
      name: 'Integration Cookie Society',
      address: '456 Security Ave',
      regNumber: `REG-COOKIE-${Date.now()}`,
      wings: ['A', 'B'],
      floors: 5,
      maintenanceAmount: 2500
    });

    testUser = await User.create({
      name: 'Cookie Test User',
      email: `cookie_tester_${Date.now()}@example.com`,
      password: rawPassword, // Will be hashed by pre-save hook
      role: 'member',
      societyId: testSociety._id,
      isActive: true
    });
  });

  it('1. should auto-generate a slug for the society via pre-save hook', () => {
    expect(testSociety.slug).toBeDefined();
    expect(testSociety.slug).toContain('integration-cookie-society');
  });

  it('2. should verify password was hashed via pre-save hook with bcrypt', async () => {
    const userInDb = await User.findById(testUser._id).select('+password');
    expect(userInDb?.password).toBeDefined();
    expect(userInDb?.password).not.toBe(rawPassword);
    expect(userInDb?.password?.startsWith('$2')).toBe(true);
    
    const isValid = await bcrypt.compare(rawPassword, userInDb!.password!);
    expect(isValid).toBe(true);
  });

  it('3. should log in and set an httpOnly auth cookie with SameSite protection', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: rawPassword
      });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();

    const cookies = res.headers['set-cookie'];
    const authCookie = cookies.find((c: string) => c.startsWith('token='));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
  });

  it('4. should successfully access /api/v1/auth/me using the cookie', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: rawPassword
      });

    const cookies = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email);
    expect(meRes.body.user.password).toBeUndefined(); // select: false
  });

  it('5. should reject /api/v1/auth/me when no cookie is sent', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('6. should reject /api/v1/auth/me with Bearer token header (cookie-only enforcement)', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: rawPassword
      });

    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // Sending Bearer in header without cookie MUST be rejected
    const headerRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(headerRes.status).toBe(401);
  });

  describe('internalOnly middleware guard', () => {
    const originalEnv = process.env.NODE_ENV;
    const testSecret = 'super-test-secret-12345';

    beforeAll(() => {
      process.env.INTERNAL_SECRET = testSecret;
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should block /api-docs/spec.json in production without internal secret', async () => {
      process.env.NODE_ENV = 'production';

      const res = await request(app).get('/api-docs/spec.json');
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should allow /api-docs/spec.json in production with valid internal secret', async () => {
      process.env.NODE_ENV = 'production';

      const res = await request(app)
        .get('/api-docs/spec.json')
        .set('x-internal-secret', testSecret);

      expect(res.status).toBe(200);
      expect(res.body.openapi || res.body.info).toBeDefined();
    });
  });
});
