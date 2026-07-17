import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gramathu_boutique_secret_key_12345';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const checkPasswordStrength = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  if (!checkPasswordStrength(password)) {
    return res.status(400).json({ success: false, message: 'Password is too weak. Must contain 8+ characters, uppercase, lowercase, number, and special character.' });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'customer',
      addresses: [],
      wishlist: [],
      loginHistory: [
        { date: new Date(), ip: req.ip || '127.0.0.1', device: req.headers['user-agent'] || 'Web Browser' }
      ]
    });

    await newUser.save();
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses,
        wishlist: newUser.wishlist
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'customer') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Save login history
    const history = user.loginHistory || [];
    history.unshift({
      date: new Date(),
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Web Browser'
    });
    user.loginHistory = history.slice(0, 10);
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWishlist = async (req, res) => {
  const { wishlist } = req.body;
  if (!Array.isArray(wishlist)) {
    return res.status(400).json({ success: false, message: 'Wishlist must be an array of product IDs' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.wishlist = wishlist;
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to sync wishlist', error: error.message });
  }
};

export const addAddress = async (req, res) => {
  const { address } = req.body;
  
  if (!address.street || !address.district || !address.state || !address.pincode || !address.phone) {
    return res.status(400).json({ success: false, message: 'Missing required address fields' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let addresses = user.addresses || [];

    if (address.id) {
      // Edit existing
      addresses = addresses.map((addr) => (addr._id.toString() === address.id ? { ...addr.toObject(), ...address } : addr));
    } else {
      // Add new
      const newAddress = { ...address };
      if (newAddress.isDefault || addresses.length === 0) {
        addresses = addresses.map((addr) => {
          addr.isDefault = false;
          return addr;
        });
        newAddress.isDefault = true;
      }
      addresses.push(newAddress);
    }

    user.addresses = addresses;
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save address', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let addresses = user.addresses || [];
    addresses = addresses.filter((addr) => addr._id.toString() !== req.params.id);
    
    if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    user.addresses = addresses;
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
};
