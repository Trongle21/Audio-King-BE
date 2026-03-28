import Banner from '../models/data/Banner.js';
import cloudinary from '../configs/cloudinary.js';
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
      const uploadedFiles = req.files || [];

      if (!uploadedFiles.length) {
        return handleError400(res, 'Banner phải có ít nhất 1 ảnh upload');
      }

      const uploadedResults = await Promise.all(
        uploadedFiles.map(file => {
          const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          return cloudinary.uploader.upload(dataUri, {
            folder: 'uploads_audio',
            resource_type: 'auto',
          });
        })
      );

      const images = uploadedResults.map((item, index) => ({
        url: item.secure_url,
        alt: uploadedFiles[index].originalname,
      }));

      const banner = await Banner.create({ images });
      return handleSuccess201(res, 'Tạo banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findById(id);
      if (!banner) {
        return handleError404(res, 'Banner không tồn tại');
      }

      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'Vui lòng upload ảnh banner để cập nhật');
      }

      const uploadedResults = await Promise.all(
        uploadedFiles.map(file => {
          const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          return cloudinary.uploader.upload(dataUri, {
            folder: 'uploads_audio',
            resource_type: 'auto',
          });
        })
      );

      banner.images = uploadedResults.map((item, index) => ({
        url: item.secure_url,
        alt: uploadedFiles[index].originalname,
      }));

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
