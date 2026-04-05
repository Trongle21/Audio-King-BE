import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    sale: { type: Number, min: 0, max: 100, default: null },
    finalPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    note: { type: String, default: '' },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: value => Array.isArray(value) && value.length > 0,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
