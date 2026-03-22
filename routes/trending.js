import { Router } from 'express';
import TrendingController from '../controllers/TrendingController.js';
import { dataMiddleWare, verifyAuth, verifyToken } from '../middleWare/index.js';
import { updateTrendingSchema } from '../schemas/index.js';

const router = Router();

// Public: lấy danh sách sản phẩm trending
router.get('/', TrendingController.getAll);

// Admin: cập nhật thứ tự trending từ frontend
router.put(
  '/',
  verifyToken,
  verifyAuth,
  dataMiddleWare(updateTrendingSchema),
  TrendingController.updatePriority
);

export default router;
