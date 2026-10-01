const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_for_jest_at_least_32_characters';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_at_least_32_characters';
process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || 'test_admin_secret_at_least_32_characters';
process.env.NODE_ENV = 'test';

jest.setTimeout(180000);

beforeAll(async () => {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 300000,
      }
    });
    uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
  } else {
    const workerId = process.env.JEST_WORKER_ID || '1';
    try {
      const parsed = new URL(uri);
      parsed.pathname = `/test_db_${workerId}`;
      uri = parsed.toString();
    } catch (e) {
      uri = `${uri}_${workerId}`;
    }
    process.env.MONGO_URI = uri;
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (err) {}

  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection && mongoose.connection.db) {
    try {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    } catch (err) {}
  }
});
