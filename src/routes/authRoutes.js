import express from 'express';
import { register, login, getMe, logout, refresh } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực người dùng
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       400:
 *         description: Email đã đăng ký
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: "Email đã được đăng ký"
 *               errorcode: "EMAIL_ALREADY_REGISTERED"
 *       500:
 *         description: Lỗi hệ thống
 */
router.post('/register', register);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "jwt_token"
 *               user:
 *                 _id: "123"
 *                 email: "test@gmail.com"
 *                 name: "User A"
 *       401:
 *         description: Sai mật khẩu hoặc tài khoản
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Sai mật khẩu hoặc tài khoản"
 *               errorcode: "INVALID_CREDENTIALS"
 *       500:
 *         description: Lỗi hệ thống
 */
router.post('/login', login);


/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Lấy access token mới từ refresh token (cookie)
 *     responses:
 *       200:
 *         description: Tạo token mới thành công
 *         content:
 *           application/json:
 *             example:
 *               message: "Lấy token mới thành công"
 *               accessToken: "new_access_token"
 *       401:
 *         description: Refresh token không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "INVALID_REFRESH_TOKEN"
 */
router.post('/refresh-token', refresh);


/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin người dùng hiện tại
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       401:
 *         description: Không có token hoặc token sai
 */
router.get('/me', protect, getMe);


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất người dùng (xóa refresh token cookie)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Đăng xuất thành công"
 *       500:
 *         description: Lỗi hệ thống
 */
router.post('/logout', protect, logout);

export default router;
