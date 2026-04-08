import mongoose, { Schema } from 'mongoose';

const USER_ROLE = ['user', 'admin'];

const UserSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    password: {
      type: String,
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'user',
      enum: USER_ROLE,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
