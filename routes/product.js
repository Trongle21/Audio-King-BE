import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import { verifyAuth, verifyToken } from '../middleWare/index.js';
import { dataMiddleWare } from '../middleWare/index.js';
import { createProductSchema, updateProductSchema } from '../schemas/index.js';

const router = Router();

// Admin: tạo sản phẩm
router.post(
  '/',
  verifyToken,
  verifyAuth,
  dataMiddleWare(createProductSchema),
  ProductController.create
);

router.patch(
  '/:id',
  verifyToken,
  verifyAuth,
  dataMiddleWare(updateProductSchema),
  ProductController.update
);

router.delete('/:id', verifyToken, verifyAuth, ProductController.softDelete);

router.patch(
  '/:id/restore',
  verifyToken,
  verifyAuth,
  ProductController.restore
);

// User + Admin: danh sách sản phẩm (tìm kiếm, filter)
router.get('/', ProductController.getAll);

// User + Admin: chi tiết sản phẩm theo id
router.get('/:id', ProductController.getById);

export default router;
