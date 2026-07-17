import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gramathu_boutique_secret_key_12345';

export const verifyAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.status) {
      return res.status(403).json({ success: false, message: 'Access denied, administrator only or account disabled' });
    }

    // Attach to req.user for compatibility with existing route controllers
    req.user = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: 'admin' // mapped role compatibility
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};
