import express from 'express';
import { getAllUsers, deleteUser , updateUserByAdmin, approveItem} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getAllUsers);
router.put('/user/:id', protect, isAdmin, updateUserByAdmin);
router.delete('/user/:id', protect, isAdmin, deleteUser);
router.put('/items/:id/approve', protect, isAdmin, approveItem);

export default router;
