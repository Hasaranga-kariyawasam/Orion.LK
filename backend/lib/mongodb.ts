import mongoose from 'mongoose';

mongoose.set('bufferCommands', false); // CRITICAL: fail fast, don't hang

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mock';
    await mongoose.connect(MONGO_URI).catch(err => {
      console.warn('[AI Studio] MongoDB not connected — some features may not work');
    });
    isConnected = true;
  } catch (e) {
    console.warn('[AI Studio] MongoDB not connected — some features may not work');
  }
}

export default connectDB;
