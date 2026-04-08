import { Router } from 'express';
import OrderController from '../controllers/OrderController.js';
import {
  dataMiddleWare,
  verifyAuth,
  verifyToken,
} from '../middleWare/index.js';
import { createOrderSchema } from '../schemas/index.js';

const router = Router();

// Guest: tạo đơn hàng từ giỏ local frontend
router.post('/', dataMiddleWare(createOrderSchema), OrderController.create);

// Admin: xem danh sách đơn hàng
router.get('/', verifyToken, verifyAuth, OrderController.getAll);

// Admin: cập nhật trạng thái thanh toán
router.patch(
  '/:id/payment-status',
  verifyToken,
  verifyAuth,
  OrderController.updatePaymentStatus
);

// Admin: xóa đơn hàng
router.delete('/:id', verifyToken, verifyAuth, OrderController.delete);

export default router;
