import { Router } from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { verifyAuth, verifyToken } from '../middleWare/index.js';

const router = Router();

router.post('/', verifyToken, verifyAuth, CategoryController.create);

// Cập nhật category (admin)
router.patch('/:id', verifyToken, verifyAuth, CategoryController.update);

// Xóa mềm category (admin) - chặn nếu còn sản phẩm
router.delete('/:id', verifyToken, verifyAuth, CategoryController.softDelete);

// Xóa cứng category khỏi DB (admin) - chặn nếu còn sản phẩm tham chiếu
router.delete(
  '/:id/hard',
  verifyToken,
  verifyAuth,
  CategoryController.hardDelete
);

// Khôi phục category (admin)
router.patch(
  '/:id/restore',
  verifyToken,
  verifyAuth,
  CategoryController.restore
);

// Lấy tất cả category + products (SEO friendly, user & admin, có tìm kiếm)
router.get('/', CategoryController.getAllWithProducts);

// Lấy chi tiết category theo id (user & admin)
router.get('/:id', CategoryController.getById);

export default router;
