import express from 'express';
import { register, login, getMe, logout, refresh } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes (Ai cũng gọi được)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refresh); 

// Private Routes (Phải có Token mới gọi được)
// Dùng middleware protect chèn vào giữa
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
export default router;