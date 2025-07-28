import express from 'express';
import { createBooking, getMyBookings, getOwnerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User creates booking
router.post('/', protect, createBooking);

router.get('/my', protect, getMyBookings); // get renter's bookings
router.get('/owner', protect, getOwnerBookings); // get owner's bookings
router.put('/:id/status', protect, updateBookingStatus); // approve or reject the booking made by user

export default router;
