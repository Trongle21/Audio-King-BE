import About from '../models/data/About.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const AboutController = {
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 12 } = req.query;
      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const aboutDocs = await About.find().sort({ updatedAt: -1 }).lean();
      const mergedImages = aboutDocs.flatMap(item => item.images || []);
      const total = mergedImages.length;
      const items = mergedImages.slice(skip, skip + limitNum);

      return handleSuccess200(res, 'Lấy danh sách ảnh about thành công', {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  create: async (req, res) => {
    try {
      const { images } = req.body;
      if (!Array.isArray(images) || images.length === 0) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh');
      }

      const about = await About.create({ images });
      return handleSuccess201(res, 'Tạo about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { images } = req.body;

      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      if (typeof images !== 'undefined') {
        if (!Array.isArray(images) || images.length === 0) {
          return handleError400(res, 'About phải có ít nhất 1 ảnh');
        }
        about.images = images;
      }

      await about.save();
      return handleSuccess200(res, 'Cập nhật about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      await About.findByIdAndDelete(id);
      return handleSuccess200(res, 'Xóa about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default AboutController;
