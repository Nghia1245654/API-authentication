import express from 'express';
import { create, update, deleteProject, getMyProjects } from '../controllers/projectController.js';
import { protect,authorize } from '../middleware/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Quản lý dự án
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Tạo dự án mới
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProjectCreateRequest"
 *     responses:
 *       200:
 *         description: Tạo dự án thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tạo dự án thành công"
 *               data:
 *                 _id: "123"
 *                 name: "Project A"
 *       500:
 *         description: Lỗi server
 */
router.post('/', protect,authorize('admin'), create);


/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Lấy danh sách dự án của tôi
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách dự án
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Project"
 *       500:
 *         description: Lỗi server
 */
router.get('/', protect, getMyProjects);


/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Cập nhật dự án
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID dự án cần sửa
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProjectUpdateRequest"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền sửa dự án này
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Bạn không có quyền sửa dự án này"
 *               errorcode: "FORBIDDEN"
 *       404:
 *         description: Không tìm thấy dự án
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Không tìm thấy"
 *               errorcode: "PROJECT_NOT_FOUND"
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', protect, update);


/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Xóa dự án
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID dự án cần xóa
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền xóa dự án này
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Bạn không có quyền xóa dự án này"
 *               errorcode: "FORBIDDEN"
 *       404:
 *         description: Không tìm thấy dự án
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Không tìm thấy"
 *               errorcode: "PROJECT_NOT_FOUND"
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', protect, deleteProject);

export default router;
