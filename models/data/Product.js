import mongoose, { Schema } from 'mongoose';
import { PRODUCT_STATUS, PRODUCT_STATUS_VALUES } from '../../enums/status.js';

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
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, min: 0 },
    sale: { type: Number, min: 0, max: 100, default: null },
    stock: { type: Number, required: true, min: 0 },
    status: {
      type: Number,
      enum: PRODUCT_STATUS_VALUES,
      default: PRODUCT_STATUS.ACTIVE,
      index: true,
    },
    description: { type: String, default: '' },
    sku: { type: String, required: true, unique: true, trim: true },
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
    thumbnail: { type: String, required: true },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
