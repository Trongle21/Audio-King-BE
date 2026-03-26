import { Router } from 'express';
import BannerController from '../controllers/BannerController.js';
import { verifyAuth, verifyToken } from '../middleWare/index.js';

const router = Router();

router.get('/', BannerController.getAll);
router.post('/', verifyToken, verifyAuth, BannerController.create);
router.patch('/:id', verifyToken, verifyAuth, BannerController.update);
router.delete('/:id', verifyToken, verifyAuth, BannerController.remove);

export default router;
