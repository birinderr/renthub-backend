import express from 'express';
import { registerUser, loginUser, verifyUser, getUserProfile} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/profile', protect, getUserProfile);

export default router;
