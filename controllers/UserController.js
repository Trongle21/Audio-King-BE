import bcrypt from 'bcryptjs';
import User from '../models/data/User.js';
import {
  handleSuccess200,
  handleError500,
  handleError404,
  handleError400,
} from '../helper/index.js';

const UserController = {
  // GET /api/users
  getAll: async (_req, res) => {
    try {
      const users = await User.find({ isDelete: false }).select('-password');
      return handleSuccess200(
        res,
        'Lấy danh sách người dùng thành công',
        users
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return handleError404(res, 'Người dùng không tồn tại');
      }
      user.isDelete = true;
      await user.save();

      const { password, ...others } = user._doc;

      return handleSuccess200(res, 'Xóa người dùng thành công', { ...others });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  restoreUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return handleError404(res, 'Người dùng không tồn tại');
      }
      if (!user.isDelete) {
        return handleError400(res, 'Người dùng đã khôi phục');
      }
      user.isDelete = false;
      await user.save();
      return handleSuccess200(res, 'Khôi phục người dùng thành công', user);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { password, new_password } = req.body;

      const user = await User.findById(id);

      if (!user) {
        return handleError404(res, 'Người dùng không tồn tại');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return handleError400(res, 'Mật khẩu không đúng');
      }

      // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
      const isSamePassword = await bcrypt.compare(new_password, user.password);
      if (isSamePassword) {
        return handleError400(
          res,
          'Mật khẩu mới không được trùng với mật khẩu cũ'
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(new_password, salt);

      user.password = hash;

      await user.save();

      const { password: _, ...others } = user._doc;

      return handleSuccess200(res, 'Đổi mật khẩu thành công', others);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default UserController;
