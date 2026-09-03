import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import Society from '../models/Society';
import User from '../models/User';
import SecurityStaff from '../models/SecurityStaff';
import MaintenanceBill from '../models/MaintenanceBill';
import Complaint from '../models/Complaint';
import Notice from '../models/Notice';
import Visitor from '../models/Visitor';
import ParkingSpace from '../models/ParkingSpace';
import logger from '../utils/logger';

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/society-management';
  logger.info(`[SEED] Connecting to database: ${mongoUri}...`);

  await mongoose.connect(mongoUri);
  logger.info('[SEED] Database connected.');

  try {
    // 1. Clean existing seed data
    logger.info('[SEED] Cleaning existing database records...');
    await Promise.all([
      Society.deleteMany({}),
      User.deleteMany({}),
      SecurityStaff.deleteMany({}),
      MaintenanceBill.deleteMany({}),
      Complaint.deleteMany({}),
      Notice.deleteMany({}),
      Visitor.deleteMany({}),
      ParkingSpace.deleteMany({}),
    ]);

    // 2. Create Societies
    logger.info('[SEED] Creating sample housing societies...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const society1 = await Society.create({
      name: 'Palm Meadows Residency',
      regNumber: 'PMR-MH-2024-001',
      address: 'Plot 42, Senapati Bapat Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      wings: ['A', 'B', 'C'],
      floors: 12,
      maintenanceAmount: 3500,
      isActive: true,
      geoJSON: {
        type: 'Polygon',
        coordinates: [
          [
            [73.82, 18.53],
            [73.84, 18.53],
            [73.84, 18.55],
            [73.82, 18.55],
            [73.82, 18.53],
          ],
        ],
      },
    });

    await Society.create({
      name: 'Green Valley Heights',
      regNumber: 'GVH-MH-2025-089',
      address: 'Sector 14, Hinjewadi Phase 1',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      wings: ['T1', 'T2'],
      floors: 18,
      maintenanceAmount: 4200,
      isActive: true,
    });

    // 3. Create Users
    logger.info('[SEED] Creating users with role accounts...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@system.com',
      password: defaultPassword,
      role: 'superadmin',
      phone: '9999999990',
      isActive: true,
    });

    const adminUser = await User.create({
      name: 'Rajesh Kulkarni (Admin)',
      email: 'admin@palmmeadows.com',
      password: defaultPassword,
      role: 'admin',
      societyId: society1._id,
      phone: '9822001122',
      isActive: true,
      flatDetails: {
        wing: 'A',
        flatNumber: '101',
        residentType: 'Owner',
      },
    });

    const resident1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@palmmeadows.com',
      password: defaultPassword,
      role: 'member',
      societyId: society1._id,
      phone: '9822003344',
      isActive: true,
      flatDetails: {
        wing: 'A',
        flatNumber: '402',
        residentType: 'Owner',
      },
    });

    const resident2 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'ananya@palmmeadows.com',
      password: defaultPassword,
      role: 'member',
      societyId: society1._id,
      phone: '9822005566',
      isActive: true,
      flatDetails: {
        wing: 'B',
        flatNumber: '701',
        residentType: 'Tenant',
      },
    });

    const resident3 = await User.create({
      name: 'Vikram Joshi',
      email: 'vikram@palmmeadows.com',
      password: defaultPassword,
      role: 'member',
      societyId: society1._id,
      phone: '9822007788',
      isActive: true,
      flatDetails: {
        wing: 'C',
        flatNumber: '204',
        residentType: 'Owner',
      },
    });

    const securityGuard = await SecurityStaff.create({
      name: 'Ramesh Shinde (Main Gate)',
      email: 'security@palmmeadows.com',
      password: defaultPassword,
      role: 'security',
      societyId: society1._id,
      phone: '9822009900',
      shift: 'Day',
      status: 'Active',
      joinDate: new Date(),
      isActive: true,
    });

    // 4. Create Maintenance Bills
    logger.info('[SEED] Creating maintenance bills...');
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    const pastDueDate = new Date(now.getFullYear(), now.getMonth() - 1, 10);

    await MaintenanceBill.insertMany([
      {
        societyId: society1._id,
        userId: resident1._id,
        title: 'Monthly Maintenance - Current',
        description: 'Water, security, common area maintenance, and lift servicing',
        amount: 3500,
        dueDate: nextMonth,
        isPaid: false,
        status: 'Pending',
      },
      {
        societyId: society1._id,
        userId: resident2._id,
        title: 'Monthly Maintenance - Previous',
        description: 'Overdue monthly society dues',
        amount: 3500,
        dueDate: pastDueDate,
        isPaid: false,
        status: 'Pending',
      },
      {
        societyId: society1._id,
        userId: resident3._id,
        title: 'Monthly Maintenance - Settled',
        description: 'Maintenance paid via UPI split payment',
        amount: 3500,
        dueDate: nextMonth,
        isPaid: true,
        status: 'Paid',
        paidDate: new Date(),
        paymentMode: 'UPI',
      },
    ]);

    // 5. Create Complaints
    logger.info('[SEED] Creating complaints & grievances...');
    await Complaint.insertMany([
      {
        title: 'Low Water Pressure on 4th Floor',
        description: 'Wing A 4th floor is receiving very low water pressure in master bathroom.',
        category: 'Water',
        priority: 'High',
        status: 'In Progress',
        societyId: society1._id,
        user: resident1._id,
      },
      {
        title: 'Wing B Lift Light Flickering',
        description: 'Lift #2 ceiling LED is flickering intermittently.',
        category: 'Lift',
        priority: 'Medium',
        status: 'Pending',
        societyId: society1._id,
        user: resident2._id,
      },
      {
        title: 'Clubhouse AC Servicing Completed',
        description: 'AC unit cleaned and gas refilled.',
        category: 'Other',
        priority: 'Low',
        status: 'Resolved',
        societyId: society1._id,
        user: resident3._id,
      },
    ]);

    // 6. Create Notices
    logger.info('[SEED] Creating society notices...');
    await Notice.create({
      title: 'Annual General Meeting (AGM) 2026',
      content: 'All residents and flat owners are cordially invited to the AGM on Sunday at 10:30 AM in the Society Clubhouse.',
      societyId: society1._id,
      createdBy: adminUser._id,
      targetType: 'All',
    });

    await Notice.create({
      title: 'Water Overhead Tank Cleaning Schedule',
      content: 'Cleaning will occur on Tuesday from 10:00 AM to 2:00 PM. Please store sufficient water.',
      societyId: society1._id,
      createdBy: adminUser._id,
      targetType: 'All',
    });

    // 7. Create Visitors
    logger.info('[SEED] Creating visitor logs...');
    await Visitor.insertMany([
      {
        name: 'Suresh Verma',
        phone: '9890112233',
        purpose: 'Courier Delivery (Amazon)',
        wing: 'A',
        flatNumber: '402',
        societyId: society1._id,
        status: 'Inside',
        checkInTime: new Date(),
      },
      {
        name: 'Dr. Meera Sen',
        phone: '9890445566',
        purpose: 'Guest Visit',
        wing: 'B',
        flatNumber: '701',
        societyId: society1._id,
        status: 'CheckedOut',
        checkInTime: new Date(Date.now() - 4 * 3600 * 1000),
        checkOutTime: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ]);

    // 8. Create Parking Spaces
    logger.info('[SEED] Creating parking allocations...');
    await ParkingSpace.insertMany([
      {
        societyId: society1._id,
        spaceNumber: 'P-A402',
        vehicleNumber: 'MH12AB1234',
        vehicleType: 'Four Wheeler',
        allocatedTo: resident1._id,
        geoJSON: {
          type: 'Polygon',
          coordinates: [[[73.83, 18.54], [73.831, 18.54], [73.831, 18.541], [73.83, 18.541], [73.83, 18.54]]],
        },
      },
      {
        societyId: society1._id,
        spaceNumber: 'P-B701',
        vehicleNumber: 'MH14CD5678',
        vehicleType: 'Four Wheeler',
        allocatedTo: resident2._id,
        geoJSON: {
          type: 'Polygon',
          coordinates: [[[73.832, 18.54], [73.833, 18.54], [73.833, 18.541], [73.832, 18.541], [73.832, 18.54]]],
        },
      },
    ]);

    logger.info('====================================================');
    logger.info('   🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!      ');
    logger.info('====================================================');
    logger.info('Default Credentials (Password: password123):');
    logger.info(`- Superadmin: ${superAdmin?.email}`);
    logger.info(`- Society Admin: ${adminUser?.email}`);
    logger.info(`- Resident 1: ${resident1?.email}`);
    logger.info(`- Resident 2: ${resident2?.email}`);
    logger.info(`- Security Guard: ${securityGuard?.email}`);
    logger.info('====================================================');

    process.exit(0);
  } catch (err: any) {
    logger.error('[SEED] Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
