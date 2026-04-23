import mongoose, { Schema } from 'mongoose';

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    review: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { _id: true, timestamps: true }
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
    highlights: {
      type: [String],
      default: [],
    },
    reviews: {
      type: [ReviewSchema],
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
