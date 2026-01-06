import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import {
  handleSuccess201,
  handleError500,
  handleError404,
  handleError409,
  handleError401,
  handleError403,
  handleSuccess200,
} from '../helper/index.js';
import User from '../models/data/User.js';

dotenv.config();

const { JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } = process.env;

let refreshTokens = [];

const AuthController = {
  // Register
  register: async (req, res) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return handleError409(res, 'Email đã được sử dụng');
      }

      const passwordUser = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(passwordUser, salt);

      const newUser = await User.create({
        ...req.body,
        password: secPass,
      });

      const { password, ...others } = newUser._doc;

      // await nodeMailer(others);

      return handleSuccess201(res, 'Đăng ký thành công', others);
    } catch (error) {
      // Trường hợp hiếm: trùng email do race condition vẫn lọt vào DB
      if (error.code === 11000 && error.keyPattern?.email) {
        return handleError409(res, 'Email đã được sử dụng');
      }
      return handleError500(res, error);
    }
  },

  // Login
  generateAccessToken: user => {
    return jwt.sign(
      {
        user: user._id,
        role: user.role,
      },
      JWT_ACCESS_TOKEN,
      { expiresIn: '30d' }
    );
  },

  generateRefreshToken: user => {
    return jwt.sign(
      {
        user: user._id,
        role: user.role,
      },
      JWT_REFRESH_TOKEN,
      { expiresIn: '365d' }
    );
  },

  login: async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return handleError404(res, 'Tài khoản hoặc mật khẩu không đúng');
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!validPassword) {
        return handleError404(res, 'Tài khoản hoặc mật khẩu không đúng');
      }

      const accessToken = AuthController.generateAccessToken(user);
      const refreshToken = AuthController.generateRefreshToken(user);

      refreshTokens.push(refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict',
      });

      const { password, ...others } = user._doc;

      return handleSuccess200(res, 'Đăng nhập thành công', {
        others,
        accessToken,
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return handleError401(res, 'Bạn chưa đăng nhập');
    if (!refreshTokens.includes(refreshToken)) {
      return handleError403(res, 'Refresh token không hợp lệ');
    }
    jwt.verify(refreshToken, JWT_REFRESH_TOKEN, (err, user) => {
      if (err) {
        return handleError403(res, err);
      }
      const newAccessToken = AuthController.generateAccessToken(user);
      const newRefreshToken = AuthController.generateRefreshToken(user);
      console.log(user);
      refreshTokens = refreshTokens.filter(token => token !== refreshToken);
      refreshTokens.push(newRefreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict',
      });

      return handleSuccess200(res, 'Cập nhật token thành công', {
        accessToken: newAccessToken,
      });
    });
  },

  // Logout
  logout: async (req, res) => {
    res.clearCookie('refreshToken');
    refreshTokens = refreshTokens.filter(
      token => token !== req.cookies.refreshToken
    );
    return handleSuccess200(res, 'Đăng xuất thành công');
  },
};

export default AuthController;
