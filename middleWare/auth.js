import jwt from 'jsonwebtoken';
import { handleError401, handleError403 } from '../helper/handleStatus.js';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_ACCESS_TOKEN } = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.token;

  if (!authHeader) {
    return handleError401(res, 'Bạn chưa đăng nhập');
  }

  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!accessToken) {
    return handleError401(res, 'Bạn chưa đăng nhập');
  }

  jwt.verify(accessToken, JWT_ACCESS_TOKEN, (err, user) => {
    if (err) {
      return handleError403(res, 'Token không hợp lệ');
    }

    req.user = user;
    next();
  });
};

const verifyAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      return handleError403(res, 'Bạn không có quyền truy cập');
    }
  });
};

export { verifyToken, verifyAuth };
