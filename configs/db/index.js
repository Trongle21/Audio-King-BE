import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0);

const { MONGO_URL } = process.env;

const connect = async () => {
  if (!MONGO_URL) {
    throw new Error('MONGO_URL is missing in environment variables');
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connect data Success');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connect;
