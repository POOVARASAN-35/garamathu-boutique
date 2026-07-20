import cloudinary from '../config/cloudinary.js';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();


// Helper to slugify product names for folder naming
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

// Configure Storage Engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folderSlug = 'temp';
//     let baseDir = 'products';
    
//     if (req.originalUrl.includes('category-images')) {
//       baseDir = 'categories';
//       const categoryName = req.query.categoryName || req.body.categoryName || 'temp';
//       folderSlug = slugify(categoryName);
//     } else {
//       const productName = req.body.productName || req.query.productName || 'temp';
//       folderSlug = slugify(productName);
//     }
    
//     const uploadDir = path.join(__dirname, `../public/uploads/${baseDir}/${folderSlug}`);
    
//     // Create folder structure if not exists
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const fileExt = path.extname(file.originalname).toLowerCase();
//     cb(null, `img-${uniqueSuffix}${fileExt}`);
//   }
// });

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'gramathu-boutique/products';

    if (req.originalUrl.includes('category-images')) {
      const categoryName =
        req.query.categoryName || req.body.categoryName || 'temp';

      folder = `gramathu-boutique/categories/${slugify(categoryName)}`;
    } else {
      const productName =
        req.body.productName || req.query.productName || 'temp';

      folder = `gramathu-boutique/products/${slugify(productName)}`;
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image'
    };
  }
});

// Configure File Filters
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// File Upload endpoint: POST /api/upload/product-images
// Supports uploading single or multiple files (field name 'images')
router.post('/product-images', verifyAdmin, (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g. file size exceeded)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '❌ Image size cannot exceed 5MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    
    // Generate relative URLs for frontend display
    const paths = req.files.map(file => file.path);
    
    res.status(200).json({
      success: true,
      message: '✅ Images uploaded successfully.',
      paths
    });
  });
});

// Category Upload endpoint: POST /api/upload/category-images
router.post('/category-images', verifyAdmin, (req, res) => {
  upload.array('images', 4)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '❌ Image size cannot exceed 5MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: `❌ Only JPG, PNG, and WEBP files are allowed.` });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image.' });
    }

    const categoryName = req.query.categoryName || req.body.categoryName || 'temp';
    const paths = req.files.map(file => file.path);

    res.json({
      success: true,
      message: '✅ Category images uploaded successfully.',
      imageUrls: paths,
      paths: paths
    });
  });
});

export default router;
