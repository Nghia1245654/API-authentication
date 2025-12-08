import express from 'express';
import { create, update, deleteProject, getMyProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
// Có thể import thêm validate middleware nếu muốn

const router = express.Router();

// Tất cả các API dưới đây đều yêu cầu phải đăng nhập
router.use(protect);

router.post('/', create);
router.get('/', getMyProjects);
router.put('/:id', update);
router.delete('/:id', deleteProject);

export default router;