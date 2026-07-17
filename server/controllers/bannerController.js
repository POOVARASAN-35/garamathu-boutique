import Banner from '../models/Banner.js';

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    const mappedBanners = banners.map(b => ({
      ...b.toObject(),
      id: `ban-${b._id.toString()}`
    }));
    res.json(mappedBanners);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving banners', error: error.message });
  }
};

export const createBanner = async (req, res) => {
  const { title, subtitle, description, image, link, status } = req.body;

  if (!title || !image) {
    return res.status(400).json({ success: false, message: 'Title and banner image are required' });
  }

  try {
    const newBanner = new Banner({
      title,
      subtitle: subtitle || '',
      description: description || '',
      image,
      link: link || '/collection/all',
      status: status || 'Active'
    });

    await newBanner.save();
    res.status(201).json({
      ...newBanner.toObject(),
      id: `ban-${newBanner._id.toString()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    Object.assign(banner, req.body);
    await banner.save();
    res.json({
      ...banner.toObject(),
      id: `ban-${banner._id.toString()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
  }
};
