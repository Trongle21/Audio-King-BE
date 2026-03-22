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

export default router;
