import express from 'express';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.post('/logout', protect, logoutUser);

export default router;
