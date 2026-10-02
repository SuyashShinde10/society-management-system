import User from '../models/User';
import SecurityStaff from '../models/SecurityStaff';
import Society from '../models/Society';
import bcrypt from 'bcryptjs';

export const updateProfile = async (userId: string, data: any) => {
  const { name, phone, parkingSlot, vehicleNumber, currentPassword, newPassword } = data;

  // select('+password') is required because password has select:false in the User schema
  let user = await User.findById(userId).select('+password');
  if (!user) {
    user = (await SecurityStaff.findById(userId).select('+password')) as any;
  }
  if (!user) throw new Error('USER_NOT_FOUND');

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  
  if (user.role !== 'security' && user.role !== 'superadmin') {
    if (parkingSlot !== undefined) user.parkingSlot = parkingSlot;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new Error('CURRENT_PASSWORD_REQUIRED');
    }
    if (!user.password) {
      throw new Error('CURRENT_PASSWORD_INCORRECT');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('CURRENT_PASSWORD_INCORRECT');
    if (newPassword.length < 8) {
      throw new Error('PASSWORD_MIN_8_CHARS');
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      throw new Error('PASSWORD_NOT_STRONG');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
  }

  await user.save();
  const userObj = (user as any).toObject();
  delete userObj.password;
  userObj.id = userObj._id;
  return userObj;
};

export const getSocietyLimits = async (societyId: string) => {
  const society = await Society.findById(societyId);
  if (!society) throw new Error('DOMAIN_NOT_FOUND');
  return { wings: society.wings, floors: society.floors };
};

export const seedSuperAdmin = async (data: any) => {
  const { email, password, secretCode } = data;
  if (secretCode !== process.env.ADMIN_SECRET_CODE) {
    throw new Error('INVALID_SECRET_CODE');
  }
  let user = await User.findOne({ email });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  if (!user) {
    user = await User.create({
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin'
    });
  } else {
    user.role = 'superadmin' as any;
    user.password = hashedPassword;
    await user.save();
  }
  return user;
};
