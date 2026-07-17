import Review from '../models/Review.js';

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: true }).sort({ createdAt: -1 });
    const mappedReviews = reviews.map(r => ({
      ...r.toObject(),
      id: `rev-${r._id.toString()}`,
      name: r.userName,
      date: r.createdAt.toISOString()
    }));
    res.json(mappedReviews);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving reviews', error: error.message });
  }
};

export const createReview = async (req, res) => {
  const { name, rating, comment, productId } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Name, rating and comment are required' });
  }

  try {
    const newReview = new Review({
      productId: productId || null,
      userName: name,
      rating: Number(rating),
      comment
    });

    await newReview.save();
    res.status(201).json({
      ...newReview.toObject(),
      id: `rev-${newReview._id.toString()}`,
      name: newReview.userName,
      date: newReview.createdAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save review', error: error.message });
  }
};
