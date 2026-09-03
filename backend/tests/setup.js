const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_for_jest_at_least_32_characters';
process.env.NODE_ENV = 'test';

jest.setTimeout(300000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 300000,
    }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
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
