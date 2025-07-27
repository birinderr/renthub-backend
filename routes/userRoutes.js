import express from 'express';
import { registerUser, loginUser, verifyUser, getUserProfile, updateUserProfile} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile',protect, updateUserProfile);

export default router;
