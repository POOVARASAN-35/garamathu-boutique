import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        websiteName: "Gramathu Boutique",
        tagline: "Traditional Elegance with Modern Style",
        logo: "",
        socialLinks: {
          instagram: "https://www.instagram.com/gramathu_design?igsh=eWRmbWp3MXdpbjl6",
          youtube: "https://youtube.com/gramathu_boutique",
          whatsapp: "https://whatsapp.com/channel/0029VbDFeYJ30LKIkbZJhx0k"
        },
        contact: {
          phone: "+91 63694 68700",
          email: "contact@gramathuboutique.com",
          address: "12, Saree Bazaar Street, Erode, Tamil Nadu - 638001"
        },
        shipping: {
          freeShippingDistrict: "Erode",
          defaultShippingCharge: 120,
          estimatedDeliveryDays: "3-5 Days"
        },
        seo: {
          title: "Gramathu Boutique | Traditional Elegance with Modern Style",
          metaDescription: "Explore a luxurious collection of premium Kanchi Semi Silk, Kubera Soft Silk, Silver Zaree, and Cotton sarees at Gramathu Boutique."
        }
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
  }
};
