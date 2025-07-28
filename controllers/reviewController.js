import Review from '../models/Review.js';
import Item from '../models/Item.js';
import Booking from '../models/Booking.js';

// @desc    Create a review for an item
// @route   POST /api/reviews/:itemId
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const itemId = req.params.itemId;
    const userId = req.user._id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const existingReview = await Review.findOne({ item: itemId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this item' });
    }

    const validBooking = await Booking.findOne({
      item: itemId,
      renter: userId,
      status: 'approved',
      endDate: { $lt: new Date() }, 
    });

    if (!validBooking) {
      return res.status(403).json({ message: 'You can only review items you have completed renting' });
    }

    const review = new Review({
      item: itemId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    
    const reviews = await Review.find({ item: itemId });

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    item.averageRating = avgRating;
    item.reviewCount = reviews.length;
    await item.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews for an item
// @route   GET /api/reviews/:itemId
// @access  Public
export const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate('user', 'name') 
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get reviews', error: error.message });
  }
};

// @desc    Get reviews by item ID
// @route   GET /api/reviews/item/:itemId
// @access  Public
export const getReviewsByItem = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate('renter', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};
