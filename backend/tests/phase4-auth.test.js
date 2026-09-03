const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User').default || require('../models/User');
const Society = require('../models/Society').default || require('../models/Society');
const Otp = require('../models/Otp').default || require('../models/Otp');
const bcrypt = require('bcryptjs');

let token;
let societyId;
let userId;

describe('Phase 4: Auth API & Security', () => {
  it('should execute full auth flow (register, login, protect, soft-delete)', async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash('123456', salt);
    await Otp.create({ email: 'newadmin@example.com', otp: hashedOtp });

    // 1. Register
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newadmin@example.com',
        otp: '123456',
        password: 'Password123',
        role: 'admin',
        name: 'John Doe',
        societyName: 'Test Society',
        address: '123 Test St',
        regNumber: 'REG_AUTH_123',
        wings: ['A', 'B'],
        floors: 10
      });

    expect(regRes.statusCode).toBe(201);
    const dbUser = await User.findOne({ email: 'newadmin@example.com' });
    societyId = dbUser.societyId;
    userId = dbUser._id;

    // 2. Reject bad login
    const badLogRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'newadmin@example.com', password: 'WrongPassword123' });
    expect(badLogRes.statusCode).toBe(401);

    // 3. Login
    const logRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'newadmin@example.com', password: 'Password123' });
    expect(logRes.statusCode).toBe(200);
    const cookie = logRes.headers['set-cookie'][0];
    token = cookie.split(';')[0].replace('token=', '');

    // 4. Reject no token
    const noTokRes = await request(app).get('/api/v1/auth/me');
    expect(noTokRes.statusCode).toBe(401);

    // 5. Soft delete
    await User.findByIdAndUpdate(userId, { deletedAt: new Date() });
    const delRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`token=${token}`]);
    
    expect(delRes.statusCode).toBe(401);
    expect(delRes.body.message).toBe('Not authorized, user not found');
  });
});
