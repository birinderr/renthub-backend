import express from 'express';
import { getAllUsers, deleteUser , updateUserByAdmin, approveItem, rejectItem, getAllItemsAdmin, getAdminStats, getAllBookingsAdmin} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getAllUsers);
router.get('/items', protect, isAdmin, getAllItemsAdmin);
router.put('/user/:id', protect, isAdmin, updateUserByAdmin);
router.delete('/user/:id', protect, isAdmin, deleteUser);
router.put('/items/:id/approve', protect, isAdmin, approveItem);
router.put('/items/:id/reject', protect, isAdmin, rejectItem);

router.get('/bookings', protect, isAdmin, getAllBookingsAdmin);

router.get('/stats', protect, isAdmin, getAdminStats);

export default router;
