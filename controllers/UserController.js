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
  getAll: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        q,
        role,
        isDelete,
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const matchStage = {};

      if (q) {
        matchStage.$or = [
          { username: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
        ];
      }

      if (role) {
        matchStage.role = role;
      }

      if (isDelete !== undefined) {
        matchStage.isDelete = String(isDelete) === 'true';
      }

      const allowedSort = {
        username: 'username',
        email: 'email',
        phone: 'phone',
        role: 'role',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };

      const sortField = allowedSort[sortBy] || 'createdAt';
      const sortDirection = order === 'asc' ? 1 : -1;

      const [users, total] = await Promise.all([
        User.find(matchStage)
          .select('-password')
          .sort({ [sortField]: sortDirection, _id: 1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(matchStage),
      ]);

      return handleSuccess200(res, 'Lấy danh sách người dùng thành công', {
        items: users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        filter: {
          q: q || null,
          role: role || null,
          isDelete: isDelete !== undefined ? String(isDelete) === 'true' : null,
          sortBy: sortField,
          order: sortDirection === 1 ? 'asc' : 'desc',
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, phone, role } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return handleError404(res, 'Người dùng không tồn tại');
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: id } })
          .select('_id')
          .lean();
        if (emailExists) {
          return handleError400(res, 'Email đã tồn tại');
        }
      }

      if (phone && phone !== user.phone) {
        const phoneExists = await User.findOne({ phone, _id: { $ne: id } })
          .select('_id')
          .lean();
        if (phoneExists) {
          return handleError400(res, 'Số điện thoại đã tồn tại');
        }
      }

      if (typeof username !== 'undefined') user.username = username;
      if (typeof email !== 'undefined') user.email = email;
      if (typeof phone !== 'undefined') user.phone = String(phone).trim();
      if (typeof role !== 'undefined') {
        if (!['user', 'admin'].includes(role)) {
          return handleError400(res, 'Role không hợp lệ');
        }
        user.role = role;
      }

      await user.save();

      const safeUser = user.toObject();
      delete safeUser.password;

      return handleSuccess200(res, 'Cập nhật người dùng thành công', safeUser);
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

      const { ...others } = user._doc;

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

      const { ...others } = user._doc;

      return handleSuccess200(res, 'Đổi mật khẩu thành công', others);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default UserController;
