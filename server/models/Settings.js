import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    websiteName: { type: String, default: 'Gramathu Boutique' },
    tagline: { type: String, default: 'Traditional Elegance with Modern Style' },
    logo: { type: String, default: '' },
    socialLinks: {
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    shipping: {
      freeShippingDistrict: { type: String, default: 'Erode' },
      defaultShippingCharge: { type: Number, default: 120 },
      estimatedDeliveryDays: { type: String, default: '3-5 Days' },
    },
    seo: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
