import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGO_URL } = process.env;

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connect data Success');
  } catch (error) {
    console.log('Error:', error);
  }
};

export default connect;
