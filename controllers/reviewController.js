import Review from '../models/Review.js';
import Item from '../models/Item.js';
import Booking from '../models/Booking.js';

// @desc    Create a review for an item
// @route   POST /api/reviews/:itemId
// @access  Private
export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const itemId = req.params.itemId;
  const userId = req.user._id;

  try {
    const booking = await Booking.findOne({
      item: itemId,
      renter: userId,
      status: 'approved',
      endDate: { $lt: new Date() }, 
    });

    if (!booking) {
      return res.status(400).json({ message: 'You can only review items you have completed renting' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ item: itemId, renter: userId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    const review = await Review.create({
      item: itemId,
      renter: userId,
      owner: booking.owner,
      rating,
      comment,
    });

    
    const reviews = await Review.find({ item: itemId });
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Item.findByIdAndUpdate(itemId, {
      averageRating: averageRating.toFixed(1),
      reviewCount: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
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

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (admin)
export const deleteReview = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: user info missing' });
  }
  const reviewId = req.params.id;
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!isAdmin) {
        if (!review.renter || review.renter.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }
    }

    const itemId = review.item;

    await review.deleteOne();

    const reviews = await Review.find({ item: itemId });

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    await Item.findByIdAndUpdate(itemId, {
      averageRating: averageRating.toFixed(1),
      reviewCount: reviews.length,
    });

    res.status(200).json({ message: 'Review deleted and item rating updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
