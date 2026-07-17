import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ categoryId: cat._id });
        return {
          ...cat.toObject(),
          name: cat.categoryName, // Backward compatibility for frontend
          image1: cat.coverImage || cat.categoryImage, // Backward compatibility for image layout
          image2: cat.categoryImages?.[1] || cat.coverImage || cat.categoryImage,
          productCount: count,
        };
      })
    );

    res.status(200).json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const count = await Product.countDocuments({ categoryId: category._id });
    res.status(200).json({
      ...category.toObject(),
      name: category.categoryName, // Backward compatibility for frontend
      image1: category.categoryImage, // Backward compatibility for image layout
      productCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const count = await Product.countDocuments({ categoryId: category._id });
    res.status(200).json({
      ...category.toObject(),
      name: category.categoryName, // Backward compatibility for frontend
      image1: category.categoryImage, // Backward compatibility for image layout
      productCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage, categoryImages, coverImage, description, displayOrder, status } = req.body;
    
    if (!categoryName) {
      return res.status(400).json({ success: false, message: 'Category Name is required.' });
    }

    const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Duplicate category names are not allowed.' });
    }

    const newCategory = new Category({
      categoryName,
      categoryImage,
      categoryImages: categoryImages || (categoryImage ? [categoryImage] : []),
      coverImage: coverImage || categoryImage || '',
      description,
      displayOrder: displayOrder || 0,
      status: status !== undefined ? status : true
    });

    await newCategory.save();
    res.status(201).json({ success: true, message: 'Category created successfully.', data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage, categoryImages, coverImage, description, displayOrder, status } = req.body;
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (categoryName && categoryName.toLowerCase() !== category.categoryName.toLowerCase()) {
      const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Duplicate category names are not allowed.' });
      }
      category.categoryName = categoryName;
    }

    if (categoryImage !== undefined) category.categoryImage = categoryImage;
    if (categoryImages !== undefined) category.categoryImages = categoryImages;
    if (coverImage !== undefined) category.coverImage = coverImage;
    if (description !== undefined) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (status !== undefined) category.status = status;

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const productCount = await Product.countDocuments({ categoryId: category._id });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category that contains active products.' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
