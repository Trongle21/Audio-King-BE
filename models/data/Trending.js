import mongoose, { Schema } from 'mongoose';

const TrendingSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
      index: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
  },
  { timestamps: true }
);

const Trending = mongoose.model('Trending', TrendingSchema);

export default Trending;
