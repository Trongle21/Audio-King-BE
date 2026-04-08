import { Router } from 'express';
import AboutController from '../controllers/AboutController.js';
import {
  dataMiddleWare,
  upload,
  verifyAuth,
  verifyToken,
} from '../middleWare/index.js';
import { deleteAboutImagesSchema } from '../schemas/index.js';

const router = Router();

router.get('/', AboutController.getAll);
router.post(
  '/',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.create
);
router.patch(
  '/:id',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.update
);
router.delete('/:id', verifyToken, verifyAuth, AboutController.remove);

router.post(
  '/images',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.addImages
);
router.patch(
  '/images',
  verifyToken,
  verifyAuth,
  upload.array('files', 10),
  AboutController.replaceImagesByIndices
);
router.delete(
  '/images',
  verifyToken,
  verifyAuth,
  dataMiddleWare(deleteAboutImagesSchema),
  AboutController.deleteImages
);

export default router;
