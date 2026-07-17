import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gramathu_boutique_secret_key_12345';

export const verifyUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check in User collection
    let user = await User.findById(decoded.id).select('-password');
    if (user) {
      if (user.role !== 'customer') {
        return res.status(403).json({ success: false, message: 'Access denied, customers only' });
      }
      
      req.user = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      };
      return next();
    }

    // Fallback: Check in Admin collection for shared routes access compatibility
    let admin = await Admin.findById(decoded.id).select('-password');
    if (admin && admin.status) {
      req.user = {
        id: admin._id,
        firstName: admin.fullName.split(' ')[0],
        lastName: admin.fullName.split(' ').slice(1).join(' ') || '',
        email: admin.email,
        role: 'admin',
        addresses: [],
        wishlist: []
      };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};
