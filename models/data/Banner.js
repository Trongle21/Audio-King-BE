import mongoose, { Schema } from 'mongoose';

const BannerImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '' },
    // Stored to support admin delete/replace without guessing from URL.
    publicId: { type: String, default: '' },
    resourceType: { type: String, default: 'image' },
  },
  { _id: false }
);

const BannerSchema = new Schema(
  {
    images: {
      type: [BannerImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', BannerSchema);

export default Banner;
