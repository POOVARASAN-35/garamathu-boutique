import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';

// Get Wishlist items (populated)
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
      await wishlist.save();
    }
    res.status(200).json({ success: true, data: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product to Wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.status(200).json({ success: true, message: 'Added to wishlist.', data: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product from Wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found.' });
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products');

    res.status(200).json({ success: true, message: 'Removed from wishlist.', data: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Move product to Cart and remove from Wishlist
export const moveToCart = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // 1. Add to Cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
    await cart.save();

    // 2. Remove from Wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.status(200).json({
      success: true,
      message: 'Product moved to shopping bag.',
      data: wishlist.products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Wishlist
export const clearWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    res.status(200).json({ success: true, message: 'Wishlist cleared.', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
