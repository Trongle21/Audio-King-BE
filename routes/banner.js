import { Router } from 'express';
import BannerController from '../controllers/BannerController.js';
import { upload, verifyAuth, verifyToken } from '../middleWare/index.js';

const router = Router();

router.get('/', BannerController.getAll);
router.post(
  '/',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  BannerController.create
);
router.patch(
  '/:id',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  BannerController.update
);
router.delete('/:id', verifyToken, verifyAuth, BannerController.remove);

export default router;
