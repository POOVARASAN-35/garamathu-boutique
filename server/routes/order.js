import express from 'express';
import { db } from '../config/db.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper to decrease inventory stock when an order is placed
const updateInventoryOnOrder = (items) => {
  for (const item of items) {
    const saree = db.getById('sarees', item.productId);
    if (saree) {
      const newStock = Math.max(0, saree.stock - item.quantity);
      db.update('sarees', item.productId, { stock: newStock });
    }
  }
};

// Helper to restore inventory if an order is cancelled
const restoreInventoryOnCancel = (items) => {
  for (const item of items) {
    const saree = db.getById('sarees', item.productId);
    if (saree) {
      db.update('sarees', item.productId, { stock: saree.stock + item.quantity });
    }
  }
};

// @desc    Create a new order
// @route   POST /api/orders
router.post('/', protect, (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }
  if (!shippingAddress || !shippingAddress.district || !shippingAddress.street) {
    return res.status(400).json({ message: 'Shipping address is incomplete' });
  }

  try {
    // 1. Fetch site shipping settings
    const settingsList = db.get('settings');
    const settings = settingsList[0] || { shipping: { freeShippingDistrict: 'Erode', defaultShippingCharge: 120 } };
    const freeDistrict = settings.shipping.freeShippingDistrict || 'Erode';
    const shippingCharge = settings.shipping.defaultShippingCharge || 120;

    // 2. Verify and calculate order prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const saree = db.getById('sarees', item.productId);
      if (!saree) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (saree.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${saree.name}. Only ${saree.stock} left.` });
      }

      const activePrice = saree.offerPrice !== undefined ? saree.offerPrice : saree.price;
      subtotal += activePrice * item.quantity;

      orderItems.push({
        productId: saree.id,
        name: saree.name,
        price: activePrice,
        quantity: item.quantity,
        image: saree.images[0]
      });
    }

    // 3. Shipping logic: Free shipping for Erode district, charges for others
    const isErode = shippingAddress.district.trim().toLowerCase() === freeDistrict.toLowerCase();
    const shippingFee = isErode ? 0 : shippingCharge;

    // 4. Coupon calculations (Simple simulation)
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
      discount = Math.round(subtotal * 0.1); // 10% off
    }

    const total = subtotal - discount + shippingFee;
    const orderId = `GB-ORD-${1000 + (db.get('orders') || []).length + 1}`;

    const newOrder = db.insert('orders', {
      id: orderId,
      customerId: req.user.id,
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      total,
      shippingAddress,
      paymentStatus: 'Paid', // Assuming Razorpay success
      orderStatus: 'Pending',
      paymentMethod: paymentMethod || 'Razorpay',
      trackingNumber: `GBTRK${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes || '',
      createdAt: new Date().toISOString()
    });

    // 5. Deduct inventory stock
    updateInventoryOnOrder(orderItems);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error processing order placement', error: error.message });
  }
});

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
router.get('/my-orders', protect, (req, res) => {
  try {
    const orders = db.get('orders') || [];
    const myOrders = orders.filter(o => o.customerId === req.user.id);
    // Sort by date
    myOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// @desc    Get specific order details (Invoice)
// @route   GET /api/orders/:id
router.get('/:id', protect, (req, res) => {
  try {
    const order = db.getById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership or admin privileges
    if (order.customerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
router.get('/', protect, admin, (req, res) => {
  try {
    const orders = db.get('orders') || [];
    orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

// @desc    Update order status (Admin Only)
// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, admin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = db.getById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    const updatedOrder = db.update('orders', req.params.id, { orderStatus: status });

    // Inventory management: Restore stock if cancelled
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      restoreInventoryOnCancel(order.items);
    } 
    // If it was cancelled and is now put back to pending, deduct inventory again
    else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
      updateInventoryOnOrder(order.items);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

export default router;
