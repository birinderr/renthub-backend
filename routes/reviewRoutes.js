import express from 'express';
const router = express.Router();

import { createReview, getItemReviews, getReviewsByItem } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create a review (only renters who completed rental)
router.post('/:itemId', protect, createReview);

// Get all reviews for an item (public)
router.get('/:itemId', getItemReviews);
router.get('/:itemId', getReviewsByItem);

export default router;
