import Banner from '../models/data/Banner.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const BannerController = {
  getAll: async (_req, res) => {
    try {
      const banners = await Banner.find().sort({ updatedAt: -1 }).lean();
      return handleSuccess200(res, 'Lấy danh sách banner thành công', banners);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  create: async (req, res) => {
    try {
      const { images } = req.body;

      if (!Array.isArray(images) || images.length === 0) {
        return handleError400(res, 'Banner phải có ít nhất 1 ảnh');
      }

      const banner = await Banner.create({ images });
      return handleSuccess201(res, 'Tạo banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { images } = req.body;

      const banner = await Banner.findById(id);
      if (!banner) {
        return handleError404(res, 'Banner không tồn tại');
      }

      if (typeof images !== 'undefined') {
        if (!Array.isArray(images) || images.length === 0) {
          return handleError400(res, 'Banner phải có ít nhất 1 ảnh');
        }
        banner.images = images;
      }

      await banner.save();
      return handleSuccess200(res, 'Cập nhật banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findById(id);

      if (!banner) {
        return handleError404(res, 'Banner không tồn tại');
      }

      await Banner.findByIdAndDelete(id);
      return handleSuccess200(res, 'Xóa banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default BannerController;
