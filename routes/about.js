import { Router } from 'express';
import AboutController from '../controllers/AboutController.js';
import { upload, verifyAuth, verifyToken } from '../middleWare/index.js';

const router = Router();

// Public: lấy danh sách ảnh about
router.get('/', AboutController.getAll);

// Admin: lấy chữ ký để frontend upload trực tiếp lên Cloudinary
router.get(
  '/upload-signature',
  verifyToken,
  verifyAuth,
  AboutController.getUploadSignature
);

// Admin: tạo/cập nhật/xóa about
router.post(
  '/',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.create
);
router.put(
  '/:id',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.update
);
router.delete('/:id', verifyToken, verifyAuth, AboutController.remove);

export default router;
