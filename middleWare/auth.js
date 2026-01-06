import jwt from 'jsonwebtoken';
import { handleError401, handleError403 } from '../helper/handleStatus.js';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_ACCESS_TOKEN } = process.env;

const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    const accessToken = token.split(' ')[1];
    if (accessToken) {
      jwt.verify(accessToken, JWT_ACCESS_TOKEN, (err, user) => {
        if (err) {
          return handleError403(res, 'Token không hợp lệ');
        } else {
          req.user = user;
          next();
        }
      });
    }
  } else {
    return handleError401(res, 'Bạn chưa đăng nhập');
  }
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
