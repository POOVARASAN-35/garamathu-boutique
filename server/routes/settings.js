import express from 'express';
import { db } from '../config/db.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 1. Site Settings Endpoints
// ==========================================

// @desc    Get website settings
// @route   GET /api/settings
router.get('/', (req, res) => {
  try {
    const settingsList = db.get('settings') || [];
    res.json(settingsList[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings' });
  }
});

// @desc    Update website settings (Admin Only)
// @route   PUT /api/settings
router.put('/', protect, admin, (req, res) => {
  try {
    const settingsList = db.get('settings') || [];
    const currentSettings = settingsList[0];

    if (!currentSettings) {
      const newSettings = db.insert('settings', req.body);
      return res.json(newSettings);
    }

    const updated = db.update('settings', currentSettings.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// ==========================================
// 2. Reviews / Testimonials Endpoints
// ==========================================

// @desc    Get all reviews
// @route   GET /api/reviews
router.get('/reviews', (req, res) => {
  try {
    const reviews = db.get('reviews') || [];
    // Return newest reviews first
    reviews.sort((a, b) => b.id.localeCompare(a.id));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// @desc    Add a review
// @route   POST /api/reviews
router.post('/reviews', (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating and comment are required' });
  }

  try {
    const newReview = db.insert('reviews', {
      id: `rev-${Date.now()}`,
      name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString()
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save review' });
  }
});

// ==========================================
// 3. Homepage Banner Management Endpoints
// ==========================================

// @desc    Get all banners
// @route   GET /api/banners
router.get('/banners', (req, res) => {
  try {
    const banners = db.get('banners') || [];
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving banners' });
  }
});

// @desc    Create banner (Admin Only)
// @route   POST /api/banners
router.post('/banners', protect, admin, (req, res) => {
  const { title, subtitle, description, image, link, status } = req.body;

  if (!title || !image) {
    return res.status(400).json({ message: 'Title and banner image are required' });
  }

  try {
    const newBanner = db.insert('banners', {
      id: `ban-${Date.now()}`,
      title,
      subtitle: subtitle || '',
      description: description || '',
      image,
      link: link || '/collection/all',
      status: status || 'Active'
    });
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner' });
  }
});

// @desc    Update banner (Admin Only)
// @route   PUT /api/banners/:id
router.put('/banners/:id', protect, admin, (req, res) => {
  try {
    const banner = db.getById('banners', req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const updated = db.update('banners', req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

// @desc    Delete banner (Admin Only)
// @route   DELETE /api/banners/:id
router.delete('/banners/:id', protect, admin, (req, res) => {
  try {
    const deleted = db.delete('banners', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner' });
  }
});

export default router;
