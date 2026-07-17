import express from 'express';
import { db } from '../config/db.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper to update product count in categories
const syncCategoryProductCounts = () => {
  const sarees = db.get('sarees') || [];
  const categories = db.get('categories') || [];
  
  const updatedCategories = categories.map(cat => {
    const count = sarees.filter(s => s.category === cat.name && s.status === 'Active').length;
    return { ...cat, productCount: count };
  });
  
  // Write back to categories db
  for (const cat of updatedCategories) {
    db.update('categories', cat.id, { productCount: cat.productCount });
  }
};

// @desc    Get all sarees (with filtering, sorting, pagination, and search)
// @route   GET /api/sarees
router.get('/', (req, res) => {
  try {
    let sarees = db.get('sarees') || [];

    // Filter by Search Query
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      sarees = sarees.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.code.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (req.query.category) {
      const categories = Array.isArray(req.query.category) 
        ? req.query.category 
        : [req.query.category];
      sarees = sarees.filter(s => categories.includes(s.category));
    }

    // Filter by Stock Availability
    if (req.query.availability) {
      if (req.query.availability === 'in-stock') {
        sarees = sarees.filter(s => s.stock > 0);
      } else if (req.query.availability === 'out-of-stock') {
        sarees = sarees.filter(s => s.stock === 0);
      }
    }

    // Filter by Price Range
    if (req.query.priceMin) {
      sarees = sarees.filter(s => (s.offerPrice || s.price) >= Number(req.query.priceMin));
    }
    if (req.query.priceMax) {
      sarees = sarees.filter(s => (s.offerPrice || s.price) <= Number(req.query.priceMax));
    }

    // Filter by Status (Regular customers only see active products, Admin sees all)
    const isAdminView = req.query.adminView === 'true';
    if (!isAdminView) {
      sarees = sarees.filter(s => s.status === 'Active');
    }

    // Sorting
    const sort = req.query.sort || 'newest';
    if (sort === 'priceAsc') {
      sarees.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
    } else if (sort === 'priceDesc') {
      sarees.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
    } else if (sort === 'ratings') {
      sarees.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else { // newest
      // Assuming higher ID or reverse order is newest
      sarees.sort((a, b) => b.id.localeCompare(a.id));
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const startIndex = (page - 1) * limit;
    const total = sarees.length;
    const paginatedSarees = sarees.slice(startIndex, startIndex + limit);

    res.json({
      sarees: paginatedSarees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// @desc    Get low stock and out of stock products (Admin Only)
// @route   GET /api/sarees/low-stock
router.get('/low-stock', protect, admin, (req, res) => {
  try {
    const sarees = db.get('sarees') || [];
    const lowStock = sarees.filter(s => s.stock > 0 && s.stock <= 5);
    const outOfStock = sarees.filter(s => s.stock === 0);
    res.json({ lowStock, outOfStock });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});

// @desc    Get individual saree details
// @route   GET /api/sarees/:id
router.get('/:id', (req, res) => {
  try {
    const saree = db.getById('sarees', req.params.id);
    if (!saree) {
      return res.status(404).json({ message: 'Saree not found' });
    }
    
    // Simulate dynamic counters on product detail view
    const views = Math.floor(Math.random() * 25) + 15; // 15 to 40 views
    const sold = Math.floor(Math.random() * 8) + 2;     // 2 to 10 sold recently

    res.json({
      ...saree,
      liveViews: views,
      recentlySold: sold
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saree detail' });
  }
});

// @desc    Create a new saree (Admin Only)
// @route   POST /api/sarees
router.post('/', protect, admin, (req, res) => {
  const { name, price, offerPrice, category, stock, color, fabric, description, images, status, featured, seoTitle, seoDescription } = req.body;

  if (!name || !price || !category || !stock || !color || !fabric || !images || images.length === 0) {
    return res.status(400).json({ message: 'Missing required product fields' });
  }

  try {
    const id = `sar-${Date.now()}`;
    const code = `GB-${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const sku = `${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}-${color.slice(0, 2).toUpperCase()}`;

    const newSaree = db.insert('sarees', {
      id,
      name,
      code,
      sku,
      description: description || '',
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      category,
      stock: Number(stock),
      color,
      fabric,
      images,
      status: status || 'Active',
      featured: featured || false,
      rating: 5.0,
      reviewsCount: 0,
      seoTitle: seoTitle || `${name} | Gramathu Boutique`,
      seoDescription: seoDescription || `${name} - Luxury ${fabric} saree at Gramathu Boutique.`
    });

    syncCategoryProductCounts();
    res.status(201).json(newSaree);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// @desc    Update a saree (Admin Only)
// @route   PUT /api/sarees/:id
router.put('/:id', protect, admin, (req, res) => {
  try {
    const saree = db.getById('sarees', req.params.id);
    if (!saree) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = { ...req.body };
    // Format numeric values
    if (updates.price) updates.price = Number(updates.price);
    if (updates.offerPrice) updates.offerPrice = Number(updates.offerPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    const updatedSaree = db.update('sarees', req.params.id, updates);
    syncCategoryProductCounts();
    res.json(updatedSaree);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// @desc    Delete a saree (Admin Only)
// @route   DELETE /api/sarees/:id
router.delete('/:id', protect, admin, (req, res) => {
  try {
    const deleted = db.delete('sarees', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    syncCategoryProductCounts();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// @desc    Duplicate a saree (Admin Only)
// @route   POST /api/sarees/:id/duplicate
router.post('/:id/duplicate', protect, admin, (req, res) => {
  try {
    const saree = db.getById('sarees', req.params.id);
    if (!saree) {
      return res.status(404).json({ message: 'Original product not found' });
    }

    const newId = `sar-${Date.now()}`;
    const code = `${saree.code}-DUP`;
    const sku = `${saree.sku}-DUP`;

    const duplicatedSaree = db.insert('sarees', {
      ...saree,
      id: newId,
      name: `${saree.name} (Copy)`,
      code,
      sku,
      stock: 5, // Reset to a safe positive default
      reviewsCount: 0,
      rating: 5.0
    });

    syncCategoryProductCounts();
    res.status(201).json(duplicatedSaree);
  } catch (error) {
    res.status(500).json({ message: 'Failed to duplicate product' });
  }
});

export default router;
