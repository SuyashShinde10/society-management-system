import * as authService from '../../services/authService';
import User from '../../models/User';
import Society from '../../models/Society';
import bcrypt from 'bcryptjs';

jest.mock('../../workers/emailQueue', () => ({
  emailQueue: {
    add: jest.fn().mockResolvedValue(true)
  }
}));

describe('authService', () => {
  let mockSociety: any;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'super_secret_test_jwt_key_1234567890';

    mockSociety = await Society.create({
      name: 'Auth Test Society',
      regNumber: `REG-AUTH-${Date.now()}`,
      address: '123 Auth Avenue',
      wings: ['A'],
      floors: 5,
      isActive: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should authenticate valid user and issue JWT token', async () => {
      const email = `testuser_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await User.create({
        name: 'Test Member',
        email,
        password: hashedPassword,
        role: 'member',
        societyId: mockSociety._id,
        isActive: true
      });

      const result = await authService.login(email, 'password123', '127.0.0.1');

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.isSecurity).toBe(false);
    });

    it('should reject invalid password', async () => {
      const email = `invalid_pass_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      await User.create({
        name: 'Test Member',
        email,
        password: hashedPassword,
        role: 'member',
        societyId: mockSociety._id,
        isActive: true
      });

      await expect(
        authService.login(email, 'wrongPassword', '127.0.0.1')
      ).rejects.toThrow('CREDENTIALS_REJECTED');
    });

    it('should reject pending/inactive accounts', async () => {
      const email = `pending_user_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await User.create({
        name: 'Pending Member',
        email,
        password: hashedPassword,
        role: 'member',
        societyId: mockSociety._id,
        isActive: false
      });

      await expect(
        authService.login(email, 'password123', '127.0.0.1')
      ).rejects.toThrow('ACCOUNT_PENDING_APPROVAL');
    });
  });

  describe('getMe', () => {
    it('should return user without password hash', async () => {
      const email = `me_user_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      const createdUser = await User.create({
        name: 'Profile User',
        email,
        password: hashedPassword,
        role: 'member',
        societyId: mockSociety._id,
        isActive: true
      });

      const userProfile = await authService.getMe(createdUser._id.toString());

      expect(userProfile).toBeDefined();
      expect(userProfile?.name).toBe('Profile User');
      expect((userProfile as any)?.password).toBeUndefined();
    });
  });
});
