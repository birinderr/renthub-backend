import express from 'express';
const router = express.Router();

import { createReview, getItemReviews, getReviewsByItem, deleteReview, getMyGivenReviews, getMyReceivedReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create a review (only renters who completed rental)
router.post('/:itemId', protect, createReview);

// Get all reviews for an item (public)
router.get('/:itemId', getItemReviews);
router.get('/:itemId', getReviewsByItem);

// delete a review (only the admin)
router.delete('/:id', protect, deleteReview);

// Get my given reviews
router.get('/my/given', protect, getMyGivenReviews);

// Get my received reviews
router.get('/my/received', protect, getMyReceivedReviews);

export default router;
