import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gramathu_boutique_secret_key_12345';

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email from request:", email);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    console.log("Admin found:", admin);

    if (!admin || !admin.status) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during admin login",
      error: error.message,
    });
  }
};
