import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';

// Get Cart details populated with Product information
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Product to Cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ success: true, message: 'Added to cart successfully.', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Cart item quantity (PUT /api/cart/:productId)
export const updateCartItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const qty = Number(quantity);

  if (qty < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = qty;
      await cart.save();
      await cart.populate('items.productId');
      res.status(200).json({ success: true, message: 'Quantity updated.', data: cart });
    } else {
      res.status(404).json({ success: false, message: 'Product not found in cart.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from Cart (DELETE /api/cart/:productId)
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ success: true, message: 'Removed from cart.', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Cart (DELETE /api/cart/clear)
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared successfully.', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply Coupon (POST /api/cart/apply-coupon)
export const applyCoupon = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required.' });
  }

  const normalizedCode = code.toUpperCase().trim();
  if (normalizedCode === 'WELCOME10') {
    res.status(200).json({ 
      success: true, 
      message: '✅ Coupon Applied Successfully', 
      coupon: { code: 'WELCOME10', discountPercent: 10 } 
    });
  } else {
    res.status(400).json({ success: false, message: '❌ Invalid Coupon Code' });
  }
};

// Move item from Cart to Wishlist (POST /api/cart/move-to-wishlist)
export const moveToWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // 1. Add to Wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // 2. Remove from Cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
      await cart.populate('items.productId');
    }

    res.status(200).json({
      success: true,
      message: 'Product moved to wishlist successfully.',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
