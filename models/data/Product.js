import mongoose, { Schema } from 'mongoose';

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    images: {
      type: [ImageSchema],
      validate: {
        validator: v => Array.isArray(v) && v.length > 0,
        message: 'Sản phẩm phải có ít nhất 1 ảnh',
      },
    },
    thumbnail: { type: ImageSchema, required: true },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    comments: {
      type: [String],
      default: [],
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
