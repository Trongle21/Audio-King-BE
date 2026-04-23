import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import UploadController from '../controllers/UploadController.js';
import {
  dataMiddleWare,
  upload,
  verifyAuth,
  verifyToken,
} from '../middleWare/index.js';
import { updateProductSchema } from '../schemas/index.js';

const router = Router();

router.post(
  '/upload-audio',
  verifyToken,
  verifyAuth,
  upload.single('file'),
  UploadController.uploadAudio
);

// Admin: tạo sản phẩm
router.post(
  '/',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
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

// Admin: danh sách sản phẩm đã xóa mềm (trash)
router.get('/deleted', verifyToken, verifyAuth, ProductController.getDeleted);

// Admin: xóa vĩnh viễn sản phẩm khỏi DB
router.delete(
  '/:id/hard',
  verifyToken,
  verifyAuth,
  ProductController.hardDelete
);

// Admin: lấy danh sách reviews của sản phẩm
router.get('/:id/reviews', ProductController.getReviews);

// Admin: thêm nhiều reviews cho sản phẩm
router.post(
  '/:id/reviews',
  verifyToken,
  verifyAuth,
  ProductController.addReviews
);

// Admin: cập nhật toàn bộ reviews của sản phẩm
router.put(
  '/:id/reviews',
  verifyToken,
  verifyAuth,
  ProductController.updateReviews
);

// Admin: xóa một review cụ thể
router.delete(
  '/:id/reviews/:reviewId',
  verifyToken,
  verifyAuth,
  ProductController.deleteReview
);

// User + Admin: danh sách sản phẩm (tìm kiếm, filter)
router.get('/', ProductController.getAll);

// User + Admin: chi tiết sản phẩm theo id
router.get('/:id', ProductController.getById);

export default router;
