import mongoose, { Schema } from 'mongoose';

const AboutImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const AboutSchema = new Schema(
  {
    images: {
      type: [AboutImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const About = mongoose.model('About', AboutSchema);

export default About;
