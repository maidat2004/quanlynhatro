import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const test = async () => {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const email = `test_${Date.now()}@example.com`;
    console.log('Creating test user with email:', email);

    const user = await User.create({
      name: 'Test Mongoose User',
      email: email,
      password: 'password123',
      phone: '0987654321',
      role: 'user'
    });

    console.log('User created successfully:', user);

    // Verify matchPassword
    const isMatch = await user.matchPassword('password123');
    console.log('Password match test:', isMatch);

    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('Test user cleaned up.');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

test();
