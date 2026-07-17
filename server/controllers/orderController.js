import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import ShippingRule from '../models/ShippingRule.js';
import User from '../models/User.js';
import { sendOrderStatusEmail } from '../utils/emailService.js';
import { generateInvoicePDF } from '../utils/invoiceService.js';
import Review from '../models/Review.js';

// Helper to decrease inventory stock when an order is placed
const updateInventoryOnOrder = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }
};

// Helper to restore inventory if an order is cancelled
const restoreInventoryOnCancel = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock = product.stock + item.quantity;
      await product.save();
    }
  }
};

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }
  if (!shippingAddress || !shippingAddress.district || !shippingAddress.street) {
    return res.status(400).json({ success: false, message: 'Shipping address is incomplete' });
  }

  try {
    // 1. Fetch site shipping settings
    const settings = await Settings.findOne() || {
      shipping: { freeShippingDistrict: 'Erode', defaultShippingCharge: 120 }
    };
    const freeDistrict = settings.shipping.freeShippingDistrict || 'Erode';
    const shippingCharge = settings.shipping.defaultShippingCharge || 120;

    // 2. Verify and calculate order prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.productName}. Only ${product.stock} left.` });
      }

      const activePrice = product.offerPrice !== undefined && product.offerPrice > 0 ? product.offerPrice : product.price;
      subtotal += activePrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.productName,
        price: activePrice,
        quantity: item.quantity,
        image: product.images[0] || ''
      });
    }

    // 3. Shipping logic: Fetch from ShippingRules
    const matchedRule = await ShippingRule.findOne({
      district: new RegExp(`^${shippingAddress.district.trim()}$`, 'i'),
      status: 'Active'
    });

    const shippingFee = matchedRule ? matchedRule.shippingCharge : shippingCharge;
    const deliveryDays = matchedRule ? matchedRule.estimatedDeliveryDays : 3;

    // 4. Coupon calculations (Simple simulation)
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
      discount = Math.round(subtotal * 0.1); // 10% off
    }

    const total = subtotal - discount + shippingFee;

    // Calculate unique order ID sequentially: GB + YYYYMMDD + 4 digits index
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const seq = String(ordersToday + 1).padStart(4, '0');
    const orderId = `GB${todayStr}${seq}`;

    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + deliveryDays);

    const newOrder = new Order({
      userId: req.user.id,
      items: orderItems,
      subtotal,
      shippingCharge: shippingFee,
      couponApplied: couponCode || '',
      discount,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      orderStatus: 'Order Confirmed',
      notes: notes || '',
      estimatedDeliveryDays: deliveryDays,
      estimatedDeliveryDate: estDeliveryDate,
      courierPartner: matchedRule ? matchedRule.courierPartner : 'DTDC',
      trackingNumber: '',
      customOrderId: orderId
    });

    await newOrder.save();

    // 5. Deduct inventory stock
    await updateInventoryOnOrder(orderItems);

    // Send confirmation email immediately
    const userDetails = await User.findById(req.user.id);
    if (userDetails) {
      sendOrderStatusEmail(newOrder, userDetails).catch(err => {
        console.error('Email confirmation error:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        ...newOrder.toObject(),
        id: orderId // Maintain compatibility with old frontend using 'id'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing order placement', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    // Add compatibility mapper
    const mappedOrders = orders.map(o => {
      const user = o.userId || {};
      const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest Customer';
      return {
        ...o.toObject(),
        id: o.customOrderId || `GB-ORD-${o._id.toString().substring(0, 6)}`,
        customerName
      };
    });
    res.json(mappedOrders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    let order = null;

    if (isValidObjectId) {
      order = await Order.findById(req.params.id).populate('userId', 'firstName lastName email');
    }

    if (!order) {
      // Check if they queried by customOrderId instead
      order = await Order.findOne({ customOrderId: req.params.id }).populate('userId', 'firstName lastName email');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.userId && order.userId._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    const user = order.userId || {};
    const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest Customer';
    res.json({
      ...order.toObject(),
      id: order.customOrderId || `GB-ORD-${order._id.toString().substring(0, 6)}`,
      customerName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order details', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // If client is a customer, return only their orders
    if (req.user && req.user.role === 'customer') {
      const orders = await Order.find({ userId: req.user.id }).populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
      const mappedOrders = orders.map(o => {
        const user = o.userId || {};
        const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest Customer';
        return {
          ...o.toObject(),
          id: o.customOrderId || `GB-ORD-${o._id.toString().substring(0, 6)}`,
          customerName
        };
      });
      return res.json(mappedOrders);
    }

    // Otherwise if administrator, return all orders
    const orders = await Order.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    const mappedOrders = orders.map(o => {
      const user = o.userId || {};
      const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest Customer';
      const email = user.email || 'N/A';
      return {
        ...o.toObject(),
        id: o.customOrderId || `GB-ORD-${o._id.toString().substring(0, 6)}`,
        customerName,
        email
      };
    });
    res.json(mappedOrders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving orders', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status, courierPartner, trackingNumber } = req.body;
  const validStatuses = ['Order Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Pending'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (courierPartner !== undefined) order.courierPartner = courierPartner;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();

    // Inventory management: Restore stock if cancelled
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      await restoreInventoryOnCancel(order.items);
    } 
    // If it was cancelled and is now put back to pending, deduct inventory again
    else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
      await updateInventoryOnOrder(order.items);
    }

    // Trigger status transition email
    const userDetails = await User.findById(order.userId);
    if (userDetails) {
      sendOrderStatusEmail(order, userDetails).catch(err => {
        console.error('Status email error:', err);
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      data: {
        ...order.toObject(),
        id: order.customOrderId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
  }
};

export const trackOrderByCustomId = async (req, res) => {
  try {
    const order = await Order.findOne({ customOrderId: req.params.orderId });
    if (!order) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.orderId);
      let fallbackOrder = null;
      if (isValidObjectId) {
        fallbackOrder = await Order.findById(req.params.orderId);
      }
      if (!fallbackOrder) {
        return res.status(404).json({ success: false, message: 'Order tracking details not found' });
      }

      return res.json({
        success: true,
        customOrderId: fallbackOrder.customOrderId || `GB-ORD-${fallbackOrder._id.toString().substring(0, 6)}`,
        orderStatus: fallbackOrder.orderStatus,
        estimatedDeliveryDate: fallbackOrder.estimatedDeliveryDate,
        courierPartner: fallbackOrder.courierPartner,
        trackingNumber: fallbackOrder.trackingNumber,
        shippingAddress: {
          district: fallbackOrder.shippingAddress.district,
          street: fallbackOrder.shippingAddress.street,
          pincode: fallbackOrder.shippingAddress.pincode
        },
        items: fallbackOrder.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image
        })),
        total: fallbackOrder.total
      });
    }

    res.json({
      success: true,
      customOrderId: order.customOrderId,
      orderStatus: order.orderStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      courierPartner: order.courierPartner,
      trackingNumber: order.trackingNumber,
      shippingAddress: {
        district: order.shippingAddress.district,
        street: order.shippingAddress.street,
        pincode: order.shippingAddress.pincode
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image
      })),
      total: order.total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking order', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    const query = isObjectId ? { _id: orderId } : { customOrderId: orderId };
    
    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' || order.orderStatus === 'Out for Delivery') {
      return res.status(400).json({ success: false, message: 'Cannot cancel order once shipped or delivered.' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore stock inventory
    if (oldStatus !== 'Cancelled') {
      await restoreInventoryOnCancel(order.items);
    }

    // Trigger status transition email
    const userDetails = await User.findById(order.userId);
    if (userDetails) {
      sendOrderStatusEmail(order, userDetails).catch(err => {
        console.error('Status email error:', err);
      });
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
};

export const returnOrder = async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    const query = isObjectId ? { _id: orderId } : { customOrderId: orderId };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only return orders that have been successfully delivered.' });
    }

    order.orderStatus = 'Refunded';
    await order.save();

    // Trigger status transition email
    const userDetails = await User.findById(order.userId);
    if (userDetails) {
      sendOrderStatusEmail(order, userDetails).catch(err => {
        console.error('Status email error:', err);
      });
    }

    res.json({ success: true, message: 'Order return request processed, refund triggered.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process return', error: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { customOrderId: id };

    const order = await Order.findOne(query).populate('userId', 'firstName lastName email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: must be order owner or admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this invoice.' });
    }

    const user = order.userId || {};
    const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer';
    const email = user.email || 'N/A';
    
    const orderDataForInvoice = {
      ...order.toObject(),
      customerName,
      email
    };

    generateInvoicePDF(orderDataForInvoice, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF', error: error.message });
  }
};

export const createOrderReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Product ID, rating, and comment are required.' });
  }

  try {
    const userDetails = await User.findById(req.user.id);
    const name = userDetails ? `${userDetails.firstName} ${userDetails.lastName || ''}`.trim() : 'Valued Customer';

    const newReview = new Review({
      productId,
      userName: name,
      rating: Number(rating),
      comment,
      status: true
    });

    await newReview.save();
    res.status(201).json({ success: true, message: 'Review submitted successfully!', data: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
};
