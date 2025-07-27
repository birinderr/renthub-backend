import express from 'express';
import { createBooking, getMyBookings, getOwnerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User creates booking
router.post('/', protect, createBooking);

router.get('/my', protect, getMyBookings);
router.get('/owner', protect, getOwnerBookings);
router.put('/:id/status', protect, updateBookingStatus);

export default router;
