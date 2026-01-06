import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { verifyAuth, verifyToken } from '../middleWare/index.js';
import { dataMiddleWare } from '../middleWare/index.js';
import { changePasswordSchema } from '../schemas/index.js';

const router = Router();

router.get('/', verifyToken, verifyAuth, UserController.getAll);

router.delete('/:id', verifyToken, verifyAuth, UserController.deleteUser);

router.put('/restore/:id', verifyToken, verifyAuth, UserController.restoreUser);

router.put(
  '/change-password/:id',
  verifyToken,
  verifyAuth,
  dataMiddleWare(changePasswordSchema),
  UserController.changePassword
);

// router.put('/:id/reset-password', verifyToken,verifyAuth, UserController.resetPassword);
export default router;
