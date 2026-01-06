import mongoose, { Schema } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

const USER_ROLE = ['user', 'admin'];

const UserSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
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

UserSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

const User = mongoose.model('User', UserSchema);
export default User;
