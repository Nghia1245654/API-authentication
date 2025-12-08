import express from 'express';
import { register, login, getMe, logout, refresh, deleteUser, updateUser, getAllUsers } from '../controllers/authController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
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
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: "JWT Access Token với format: Bearer <token>"
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *             example:
 *               success: true
 *               message: "Lấy thông tin thành công"
 *               data:
 *                 _id: "123"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 role: "user"
 *       401:
 *         description: Không có token hoặc token sai
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Token không hợp lệ hoặc đã hết hạn"
 *               errorcode: "TOKEN_INVALID"
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Đăng xuất thành công"
 *       401:
 *         description: Không có token hoặc token sai
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Token không hợp lệ hoặc đã hết hạn"
 *               errorcode: "TOKEN_INVALID"
 *       500:
 *         description: Lỗi hệ thống
 */
router.post('/logout', protect, logout);
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     tags: [Auth]
 *     summary: Xóa người dùng hiện tại
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Xóa người dùng thành công"
 *       401:
 *         description: Không có token hoặc token sai
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Token không hợp lệ hoặc đã hết hạn"
 *               errorcode: "TOKEN_INVALID"
 *       500:
 *         description: Lỗi hệ thống
 */
router.delete('/delete/:id', protect,authorize('admin'), deleteUser);
/**
 * @swagger
 * /auth/update:
 *   put:
 *     tags: [Auth]
 *     summary: Cập nhật thông tin người dùng
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Name"
 *               email:
 *                 type: string
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Cập nhật người dùng thành công"
 *               data:
 *                 _id: "123"
 *                 name: "New Name"
 *                 email: "newemail@example.com"
 *                 role: "user"
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi hệ thống
*/
router.put('/update/:id', protect, updateUser);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy danh sách người dùng (có phân trang, tìm kiếm, lọc)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng users mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Lọc theo role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sắp xếp theo field (name, email, createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Lấy tất cả người dùng thành công"
 *               data:
 *                 users:
 *                   - _id: "123"
 *                     name: "John Doe"
 *                     email: "user@example.com"
 *                     role: "user"
 *                     createdAt: "2025-12-01T00:00:00.000Z"
 *                 pagination:
 *                   total: 50
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 5
 *       401:
 *         description: Không có token hoặc token sai
 *       403:
 *         description: Không có quyền (chỉ admin)
 *       500:
 *         description: Lỗi hệ thống
 */
router.get('/users', protect, getAllUsers);

export default router;
