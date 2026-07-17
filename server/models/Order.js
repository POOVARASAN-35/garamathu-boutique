import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    shippingCharge: { type: Number, required: true, default: 0 },
    couponApplied: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    shippingAddress: {
      street: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'cod' },
    paymentStatus: { type: String, default: 'Pending' },
    orderStatus: { 
      type: String, 
      enum: ['Order Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Pending'], 
      default: 'Order Confirmed' 
    },
    estimatedDeliveryDays: { type: Number, default: 1 },
    estimatedDeliveryDate: { type: Date },
    courierPartner: { type: String, default: 'DTDC' },
    trackingNumber: { type: String, default: '' },
    customOrderId: { type: String, unique: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
