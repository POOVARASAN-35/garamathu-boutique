import express from 'express';
import { db } from '../config/db.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', (req, res) => {
  try {
    const categories = db.get('categories') || [];
    // Sort by display order
    categories.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});

// @desc    Create a category (Admin Only)
// @route   POST /api/categories
router.post('/', protect, admin, (req, res) => {
  const { name, image1, image2, displayOrder, status } = req.body;

  if (!name || !image1) {
    return res.status(400).json({ message: 'Category name and primary image are required' });
  }

  try {
    const categories = db.get('categories') || [];
    const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());

    if (nameExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = db.insert('categories', {
      id: `cat-${Date.now()}`,
      name,
      image1,
      image2: image2 || image1, // Fallback if no second image
      productCount: 0,
      displayOrder: displayOrder ? Number(displayOrder) : categories.length + 1,
      status: status || 'Active'
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// @desc    Update a category (Admin Only)
// @route   PUT /api/categories/:id
router.put('/:id', protect, admin, (req, res) => {
  try {
    const category = db.getById('categories', req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updates = { ...req.body };
    if (updates.displayOrder) updates.displayOrder = Number(updates.displayOrder);

    const updatedCategory = db.update('categories', req.params.id, updates);
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// @desc    Delete a category (Admin Only)
// @route   DELETE /api/categories/:id
router.delete('/:id', protect, admin, (req, res) => {
  try {
    const deleted = db.delete('categories', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;
