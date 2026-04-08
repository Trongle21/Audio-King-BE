import { Router } from 'express';
import BannerController from '../controllers/BannerController.js';
import {
  dataMiddleWare,
  upload,
  verifyAuth,
  verifyToken,
} from '../middleWare/index.js';
import { deleteBannerImagesSchema } from '../schemas/index.js';

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

// Singleton helper endpoints: thao tác trực tiếp trên `banner.images`
router.post(
  '/images',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  BannerController.addImages
);
router.patch(
  '/images',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  BannerController.replaceImagesByIndices
);
router.delete(
  '/images',
  verifyToken,
  verifyAuth,
  dataMiddleWare(deleteBannerImagesSchema),
  BannerController.deleteImages
);

export default router;
