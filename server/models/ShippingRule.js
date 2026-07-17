import mongoose from 'mongoose';

const shippingRuleSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, unique: true },
    shippingCharge: { type: Number, required: true, default: 0 },
    estimatedDeliveryDays: { type: Number, required: true, default: 1 },
    courierPartner: { type: String, default: 'DTDC' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

const ShippingRule = mongoose.model('ShippingRule', shippingRuleSchema);
export default ShippingRule;
