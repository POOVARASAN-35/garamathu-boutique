import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      priceMin, 
      priceMax, 
      sort, 
      isFeatured, 
      isCombo, 
      search, 
      q, 
      page, 
      limit,
      adminView,
      availability
    } = req.query;

    let query = {};

    // Support category Name/Slug
    if (category) {
      const categoriesList = await Category.find({ 
        $or: [
          { categoryName: { $in: Array.isArray(category) ? category : [category] } },
          { slug: { $in: Array.isArray(category) ? category : [category] } }
        ]
      });
      const catIds = categoriesList.map(c => c._id);
      query.categoryId = { $in: catIds };
    }

    // Support both priceMin/minPrice
    const finalMinPrice = priceMin !== undefined ? priceMin : minPrice;
    const finalMaxPrice = priceMax !== undefined ? priceMax : maxPrice;
    if (finalMinPrice !== undefined || finalMaxPrice !== undefined) {
      query.price = {};
      if (finalMinPrice !== undefined && finalMinPrice !== '') query.price.$gte = Number(finalMinPrice);
      if (finalMaxPrice !== undefined && finalMaxPrice !== '') query.price.$lte = Number(finalMaxPrice);
    }

    // Featured & Combo flags
    if (isFeatured !== undefined && isFeatured !== '') query.isFeatured = isFeatured === 'true';
    if (isCombo !== undefined && isCombo !== '') query.isCombo = isCombo === 'true';

    // Availability
    if (availability === 'in-stock') {
      query.stock = { $gt: 0 };
    } else if (availability === 'out-of-stock') {
      query.stock = 0;
    }

    // Regular customers only see status: 'Active', admin sees all
    const isAdminView = adminView === 'true';
    if (!isAdminView) {
      query.status = 'Active';
    }

    // Search query (support both search and q)
    const finalSearch = q !== undefined ? q : search;
    if (finalSearch) {
      query.$or = [
        { productName: { $regex: finalSearch, $options: 'i' } },
        { productCode: { $regex: finalSearch, $options: 'i' } },
        { description: { $regex: finalSearch, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === 'price-low' || sort === 'priceAsc') sortOptions = { price: 1 };
      else if (sort === 'price-high' || sort === 'priceDesc') sortOptions = { price: -1 };
      else if (sort === 'rating' || sort === 'ratings') sortOptions = { rating: -1 };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('categoryId', 'categoryName slug')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limitNum);

    const mappedProducts = products.map(prod => {
      const obj = prod.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        name: obj.productName,
        category: obj.categoryId ? obj.categoryId.categoryName : '',
        featured: obj.isFeatured,
      };
    });

    res.status(200).json({
      sarees: mappedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let categoryQuery = {};
    
    if (categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      categoryQuery._id = categoryId;
    } else {
      categoryQuery.$or = [
        { slug: categoryId },
        { categoryName: categoryId }
      ];
    }

    const category = await Category.findOne(categoryQuery);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const products = await Product.find({ categoryId: category._id, status: 'Active' })
      .populate('categoryId', 'categoryName slug');

    const mapped = products.map(prod => {
      const obj = prod.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        name: obj.productName,
        category: obj.categoryId ? obj.categoryId.categoryName : '',
        featured: obj.isFeatured,
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'categoryName slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const mapped = {
      ...product.toObject(),
      id: product._id.toString(),
      name: product.productName,
      category: product.categoryId ? product.categoryId.categoryName : '',
      featured: product.isFeatured
    };
    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let query = {};
    
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = slug;
    } else {
      query.slug = slug;
    }

    const product = await Product.findOne(query).populate('categoryId', 'categoryName slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const mapped = {
      ...product.toObject(),
      id: product._id.toString(),
      name: product.productName,
      category: product.categoryId ? product.categoryId.categoryName : '',
      featured: product.isFeatured
    };
    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    // compatibility mapping from legacy frontend layout
    let finalCategoryId = req.body.categoryId;
    if (!finalCategoryId && req.body.category) {
      const categoryDoc = await Category.findOne({
        $or: [
          { categoryName: req.body.category },
          { slug: req.body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        ]
      });
      if (categoryDoc) {
        finalCategoryId = categoryDoc._id;
      }
    }

    const finalProductName = req.body.productName || req.body.name;
    
    let finalProductCode = req.body.productCode;
    if (!finalProductCode) {
      const catPrefix = (req.body.category || 'GEN').slice(0, 3).toUpperCase();
      finalProductCode = `GB-${catPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const { 
      description, 
      price, 
      originalPrice,
      offerPrice, 
      stock, 
      images, 
      fabric, 
      color, 
      featured,
      isFeatured, 
      isCombo, 
      comboProduct,
      status,
      brand,
      shortDescription,
      gst,
      hsnCode,
      costPrice,
      lowStockAlert,
      availability,
      sareeLength,
      blousePiece,
      blouseFabric,
      borderType,
      weavingType,
      workType,
      pattern,
      occasion,
      style,
      weight,
      washCare,
      primaryColor,
      secondaryColor,
      colorTheme,
      coverImage,
      videos,
      bestseller,
      trending,
      newArrival,
      hotSelling,
      limitedEdition,
      todayDeal,
      shippingWeight,
      shippingLength,
      shippingWidth,
      shippingHeight,
      shippingType,
      deliveryTime,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      relatedProducts,
      displayOrder,
      adminNotes
    } = req.body;

    if (!finalCategoryId) return res.status(400).json({ success: false, message: 'Category ID is required.' });
    if (!finalProductName) return res.status(400).json({ success: false, message: 'Product Name is required.' });
    if (!finalProductCode) return res.status(400).json({ success: false, message: 'Product Code is required.' });
    
    const finalPrice = originalPrice !== undefined ? originalPrice : price;
    if (finalPrice === undefined || finalPrice < 0) return res.status(400).json({ success: false, message: 'Price must be greater than or equal to 0.' });
    if (stock === undefined || stock < 0) return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });

    const codeExists = await Product.findOne({ productCode: { $regex: new RegExp(`^${finalProductCode}$`, 'i') } });
    if (codeExists) {
      return res.status(400).json({ success: false, message: 'Duplicate product codes are not allowed.' });
    }

    const newProduct = new Product({
      categoryId: finalCategoryId,
      productName: finalProductName,
      productCode: finalProductCode,
      description: description || '',
      originalPrice: Number(finalPrice),
      price: Number(finalPrice),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      stock: Number(stock),
      images: images || [],
      fabric: fabric || '',
      color: color || '',
      featured: featured !== undefined ? featured : (isFeatured !== undefined ? isFeatured : false),
      comboProduct: comboProduct !== undefined ? comboProduct : (isCombo !== undefined ? isCombo : false),
      status: status || 'Active',
      brand: brand || 'Gramathu Boutique',
      shortDescription: shortDescription || '',
      gst: gst ? Number(gst) : 0,
      hsnCode: hsnCode || '',
      costPrice: costPrice ? Number(costPrice) : undefined,
      lowStockAlert: lowStockAlert ? Number(lowStockAlert) : 5,
      availability: availability || 'In Stock',
      sareeLength: sareeLength || '5.5 Meters',
      blousePiece: blousePiece || 'Included',
      blouseFabric: blouseFabric || '',
      borderType: borderType || '',
      weavingType: weavingType || '',
      workType: workType || '',
      pattern: pattern || '',
      occasion: occasion || '',
      style: style || '',
      weight: weight || '450 grams',
      washCare: washCare || 'Dry clean only',
      primaryColor: primaryColor || '',
      secondaryColor: secondaryColor || '',
      colorTheme: colorTheme || '',
      coverImage: coverImage || '',
      videos: videos || [],
      bestseller: bestseller !== undefined ? bestseller : false,
      trending: trending !== undefined ? trending : false,
      newArrival: newArrival !== undefined ? newArrival : false,
      hotSelling: hotSelling !== undefined ? hotSelling : false,
      limitedEdition: limitedEdition !== undefined ? limitedEdition : false,
      todayDeal: todayDeal !== undefined ? todayDeal : false,
      shippingWeight: shippingWeight ? Number(shippingWeight) : 0,
      shippingLength: shippingLength ? Number(shippingLength) : 0,
      shippingWidth: shippingWidth ? Number(shippingWidth) : 0,
      shippingHeight: shippingHeight ? Number(shippingHeight) : 0,
      shippingType: shippingType || 'Free Shipping',
      deliveryTime: deliveryTime || '',
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      seoKeywords: seoKeywords || '',
      canonicalUrl: canonicalUrl || '',
      relatedProducts: relatedProducts || [],
      displayOrder: displayOrder ? Number(displayOrder) : 1,
      adminNotes: adminNotes || ''
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // compatibility mapping from legacy frontend update format
    if (req.body.name !== undefined) {
      req.body.productName = req.body.name;
    }
    if (req.body.category !== undefined) {
      const categoryDoc = await Category.findOne({
        $or: [
          { categoryName: req.body.category },
          { slug: req.body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        ]
      });
      if (categoryDoc) {
        req.body.categoryId = categoryDoc._id;
      }
    }

    const { productCode, price, originalPrice, stock } = req.body;

    if (productCode && productCode.toLowerCase() !== product.productCode.toLowerCase()) {
      const codeExists = await Product.findOne({ productCode: { $regex: new RegExp(`^${productCode}$`, 'i') } });
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Duplicate product codes are not allowed.' });
      }
    }

    const finalPrice = originalPrice !== undefined ? originalPrice : price;
    if (finalPrice !== undefined && finalPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than or equal to 0.' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });
    }

    const fieldsToUpdate = [
      'categoryId', 'productName', 'productCode', 'description', 
      'price', 'originalPrice', 'offerPrice', 'stock', 'images', 'fabric', 'color', 
      'isFeatured', 'featured', 'isCombo', 'comboProduct', 'status',
      'brand', 'shortDescription', 'gst', 'hsnCode', 'costPrice',
      'lowStockAlert', 'availability', 'sareeLength', 'blousePiece',
      'blouseFabric', 'borderType', 'weavingType', 'workType',
      'pattern', 'occasion', 'style', 'weight', 'washCare',
      'primaryColor', 'secondaryColor', 'colorTheme', 'coverImage',
      'videos', 'bestseller', 'trending', 'newArrival', 'hotSelling',
      'limitedEdition', 'todayDeal', 'shippingWeight', 'shippingLength',
      'shippingWidth', 'shippingHeight', 'shippingType', 'deliveryTime',
      'seoTitle', 'seoDescription', 'seoKeywords', 'canonicalUrl',
      'relatedProducts', 'displayOrder', 'adminNotes'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        const numFields = [
          'price', 'originalPrice', 'offerPrice', 'stock', 'gst', 'costPrice', 
          'lowStockAlert', 'shippingWeight', 'shippingLength', 'shippingWidth', 
          'shippingHeight', 'displayOrder'
        ];
        if (numFields.includes(field)) {
          product[field] = req.body[field] !== null && req.body[field] !== '' && req.body[field] !== undefined 
            ? Number(req.body[field]) 
            : undefined;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
