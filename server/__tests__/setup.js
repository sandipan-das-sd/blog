import mongoose from 'mongoose';

// Setup before all tests
beforeAll(async () => {
  // Use test database
  const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/blog-system-test';
  
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(testDbUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// Clear database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

