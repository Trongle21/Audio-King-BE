import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', CategorySchema);

export default Category;
