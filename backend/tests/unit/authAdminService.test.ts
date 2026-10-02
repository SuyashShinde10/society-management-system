import * as authAdminService from '../../services/authAdminService';
import User from '../../models/User';
import Society from '../../models/Society';
import bcrypt from 'bcryptjs';

describe('authAdminService.updateProfile', () => {
  let mockSociety: any;
  let testUser: any;
  const originalPassword = 'OldPassword123';

  beforeEach(async () => {
    mockSociety = await Society.create({
      name: 'Profile Test Society',
      regNumber: `REG-PROF-${Date.now()}-${Math.random()}`,
      address: '456 Profile St',
      wings: ['A', 'B'],
      floors: 4,
      isActive: true
    });

    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    testUser = await User.create({
      name: 'John Doe',
      email: `johndoe_${Date.now()}_${Math.random()}@test.com`,
      password: hashedPassword,
      role: 'member',
      societyId: mockSociety._id,
      isActive: true,
      mustChangePassword: true
    });
  });

  it('should update name, phone, parking, and vehicle info without password change', async () => {
    const updated = await authAdminService.updateProfile(testUser._id.toString(), {
      name: 'Jane Doe',
      phone: '9876543210',
      parkingSlot: 'P-101',
      vehicleNumber: 'MH-12-AB-1234'
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe('Jane Doe');
    expect(updated.phone).toBe('9876543210');
    expect(updated.parkingSlot).toBe('P-101');
    expect(updated.vehicleNumber).toBe('MH-12-AB-1234');
    expect(updated.password).toBeUndefined();

    // Verify in DB
    const dbUser = await User.findById(testUser._id);
    expect(dbUser?.name).toBe('Jane Doe');
    expect(dbUser?.mustChangePassword).toBe(true);
  });

  it('should successfully change password when current password is valid and new password is strong', async () => {
    const newPassword = 'NewSecretPassword123';

    const updated = await authAdminService.updateProfile(testUser._id.toString(), {
      currentPassword: originalPassword,
      newPassword
    });

    expect(updated).toBeDefined();
    expect(updated.mustChangePassword).toBe(false);
    expect(updated.password).toBeUndefined();

    // Verify in DB with +password that new password matches
    const dbUser = await User.findById(testUser._id).select('+password');
    expect(dbUser?.mustChangePassword).toBe(false);
    expect(await bcrypt.compare(newPassword, dbUser!.password!)).toBe(true);
    expect(await bcrypt.compare(originalPassword, dbUser!.password!)).toBe(false);
  });

  it('should reject password change when current password is wrong', async () => {
    await expect(
      authAdminService.updateProfile(testUser._id.toString(), {
        currentPassword: 'WrongPassword123',
        newPassword: 'NewSecretPassword123'
      })
    ).rejects.toThrow('CURRENT_PASSWORD_INCORRECT');
  });

  it('should reject password change when current password is missing', async () => {
    await expect(
      authAdminService.updateProfile(testUser._id.toString(), {
        newPassword: 'NewSecretPassword123'
      })
    ).rejects.toThrow('CURRENT_PASSWORD_REQUIRED');
  });

  it('should reject password change when new password is too short', async () => {
    await expect(
      authAdminService.updateProfile(testUser._id.toString(), {
        currentPassword: originalPassword,
        newPassword: 'Short1'
      })
    ).rejects.toThrow('PASSWORD_MIN_8_CHARS');
  });

  it('should reject password change when new password lacks required character variety', async () => {
    await expect(
      authAdminService.updateProfile(testUser._id.toString(), {
        currentPassword: originalPassword,
        newPassword: 'alllowercase123'
      })
    ).rejects.toThrow('PASSWORD_NOT_STRONG');
  });
});
