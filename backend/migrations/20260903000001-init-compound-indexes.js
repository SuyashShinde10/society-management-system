module.exports = {
  async up(db, client) {
    // 1. Users compound indexes
    await db.collection('users').createIndex({ societyId: 1, role: 1 });
    await db.collection('users').createIndex({ societyId: 1, email: 1 });

    // 2. Maintenance bills compound indexes
    await db.collection('maintenancebills').createIndex({ societyId: 1, status: 1, dueDate: -1 });
    await db.collection('maintenancebills').createIndex({ societyId: 1, userId: 1 });

    // 3. Complaints compound indexes
    await db.collection('complaints').createIndex({ societyId: 1, status: 1, createdAt: -1 });

    // 4. Notices compound indexes
    await db.collection('notices').createIndex({ societyId: 1, createdAt: -1 });

    // 5. Visitors compound indexes
    await db.collection('visitors').createIndex({ societyId: 1, status: 1, checkInTime: -1 });
  },

  async down(db, client) {
    try {
      await db.collection('users').dropIndex({ societyId: 1, role: 1 });
      await db.collection('users').dropIndex({ societyId: 1, email: 1 });
      await db.collection('maintenancebills').dropIndex({ societyId: 1, status: 1, dueDate: -1 });
      await db.collection('maintenancebills').dropIndex({ societyId: 1, userId: 1 });
      await db.collection('complaints').dropIndex({ societyId: 1, status: 1, createdAt: -1 });
      await db.collection('notices').dropIndex({ societyId: 1, createdAt: -1 });
      await db.collection('visitors').dropIndex({ societyId: 1, status: 1, checkInTime: -1 });
    } catch (e) {
      // Ignore if index doesn't exist
    }
  }
};
