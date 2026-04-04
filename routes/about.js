import { Router } from 'express';
import AboutController from '../controllers/AboutController.js';
import { verifyAuth, verifyToken } from '../middleWare/index.js';

const router = Router();

// Public: lấy danh sách ảnh about
router.get('/', AboutController.getAll);

// Admin: tạo/cập nhật/xóa about
router.post('/', verifyToken, verifyAuth, AboutController.create);
router.put('/:id', verifyToken, verifyAuth, AboutController.update);
router.delete('/:id', verifyToken, verifyAuth, AboutController.remove);

export default router;
