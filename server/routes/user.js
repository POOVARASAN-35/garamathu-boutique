import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gramathu_boutique_secret_key_12345';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Password validation regex
const checkPasswordStrength = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!checkPasswordStrength(password)) {
    return res.status(400).json({ message: 'Password is too weak. Must contain 8+ characters, uppercase, lowercase, number, and special character.' });
  }

  try {
    const users = db.get('users');
    const userExists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = db.insert('users', {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      addresses: [],
      wishlist: [],
      loginHistory: [
        { date: new Date().toISOString(), ip: req.ip || '127.0.0.1', device: req.headers['user-agent'] || 'Web Browser' }
      ]
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses,
        wishlist: newUser.wishlist
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const users = db.get('users');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Save login history
    const history = user.loginHistory || [];
    history.unshift({
      date: new Date().toISOString(),
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Web Browser'
    });
    db.update('users', user.id, { loginHistory: history.slice(0, 10) });

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// @desc    Get all customers (Admin Only)
// @route   GET /api/users
router.get('/', protect, admin, (req, res) => {
  const users = db.get('users');
  const customers = users.map(({ password, ...info }) => info);
  res.json(customers);
});

// @desc    Get customer details by ID (Admin Only)
// @route   GET /api/users/:id
router.get('/:id', protect, admin, (req, res) => {
  const user = db.getById('users', req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  const { password, ...customerInfo } = user;
  res.json(customerInfo);
});

// @desc    Update user wishlist
// @route   POST /api/users/wishlist
router.post('/wishlist', protect, (req, res) => {
  const { wishlist } = req.body; // Expecting array of product IDs
  if (!Array.isArray(wishlist)) {
    return res.status(400).json({ message: 'Wishlist must be an array of product IDs' });
  }

  try {
    const updatedUser = db.update('users', req.user.id, { wishlist });
    res.json({ wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync wishlist' });
  }
});

// @desc    Add/Update user addresses
// @route   POST /api/users/address
router.post('/address', protect, (req, res) => {
  const { address } = req.body; // address object: { id, street, district, state, pincode, phone, isDefault }
  
  if (!address.street || !address.district || !address.state || !address.pincode || !address.phone) {
    return res.status(400).json({ message: 'Missing required address fields' });
  }

  try {
    const user = db.getById('users', req.user.id);
    let addresses = user.addresses || [];

    if (address.id) {
      // Edit existing
      addresses = addresses.map((addr) => (addr.id === address.id ? { ...addr, ...address } : addr));
    } else {
      // Add new
      const newAddress = { ...address, id: `addr-${Date.now()}` };
      if (newAddress.isDefault || addresses.length === 0) {
        addresses = addresses.map((addr) => ({ ...addr, isDefault: false }));
        newAddress.isDefault = true;
      }
      addresses.push(newAddress);
    }

    const updatedUser = db.update('users', req.user.id, { addresses });
    res.json({ addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save address' });
  }
});

// @desc    Delete user address
// @route   DELETE /api/users/address/:id
router.delete('/address/:id', protect, (req, res) => {
  try {
    const user = db.getById('users', req.user.id);
    let addresses = user.addresses || [];
    addresses = addresses.filter((addr) => addr.id !== req.params.id);
    
    // Ensure at least one default if we have addresses left
    if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    const updatedUser = db.update('users', req.user.id, { addresses });
    res.json({ addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete address' });
  }
});

export default router;
