import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { loginSchema, registerSchema } from "../schemas/index.js";
import { dataMiddleWare } from "../middleWare/index.js";
import { verifyToken } from "../middleWare/index.js";

const router = Router();

router.post(
  "/register",
  dataMiddleWare(registerSchema),
  AuthController.register
);

router.post("/login", dataMiddleWare(loginSchema), AuthController.login);

router.post("/refreshToken", AuthController.requestRefreshToken);

router.post("/logout", verifyToken, AuthController.logout);

export default router;
