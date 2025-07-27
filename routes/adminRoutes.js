import express from 'express';
import { getAllUsers, deleteUser , updateUserByAdmin} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getAllUsers);
router.put('/users/:id', protect, isAdmin, updateUserByAdmin);
router.delete('/user/:id', protect, isAdmin, deleteUser);

export default router;
