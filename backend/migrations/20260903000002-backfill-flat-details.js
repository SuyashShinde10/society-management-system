module.exports = {
  async up(db, client) {
    // Backfill flatDetails for users having legacy flatNumber or wing at the root
    const legacyUsers = await db.collection('users').find({
      $or: [
        { flatDetails: { $exists: false } },
        { flatDetails: null },
      ]
    }).toArray();

    for (const user of legacyUsers) {
      const wing = user.wing || 'A';
      const flatNumber = user.flatNumber || '101';
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            flatDetails: {
              wing,
              flatNumber,
              residentType: user.residentType || 'Owner',
              moveInDate: user.createdAt || new Date(),
            }
          }
        }
      );
    }
  },

  async down(db, client) {
    // Reversible if needed
  }
};
