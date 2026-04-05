import About from '../models/data/About.js';
import cloudinary from '../configs/cloudinary.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const AboutController = {
  getUploadSignature: async (_req, res) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'uploads_about';
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET
      );

      return handleSuccess200(res, 'Lấy chữ ký upload thành công', {
        timestamp,
        folder,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

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
      const uploadedFiles = req.files || [];
      const rawImages = req.body.images;

      let parsedImages = [];
      if (Array.isArray(rawImages)) {
        parsedImages = rawImages;
      } else if (typeof rawImages === 'string' && rawImages.trim()) {
        try {
          parsedImages = JSON.parse(rawImages);
        } catch {
          return handleError400(res, 'images không đúng định dạng JSON');
        }
      }

      if (uploadedFiles.length) {
        const uploadedResults = await Promise.all(
          uploadedFiles.map(file => {
            const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinary.uploader.upload(dataUri, {
              folder: 'uploads_about',
              resource_type: 'image',
            });
          })
        );

        const uploadedImages = uploadedResults.map((item, index) => ({
          url: item.secure_url,
          alt: uploadedFiles[index].originalname || '',
        }));

        parsedImages = [...parsedImages, ...uploadedImages];
      }

      if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh');
      }

      const about = await About.create({ images: parsedImages });
      return handleSuccess201(res, 'Tạo about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const uploadedFiles = req.files || [];
      const rawImages = req.body.images;

      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      let parsedImages = [];
      if (Array.isArray(rawImages)) {
        parsedImages = rawImages;
      } else if (typeof rawImages === 'string' && rawImages.trim()) {
        try {
          parsedImages = JSON.parse(rawImages);
        } catch {
          return handleError400(res, 'images không đúng định dạng JSON');
        }
      }

      if (uploadedFiles.length) {
        const uploadedResults = await Promise.all(
          uploadedFiles.map(file => {
            const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinary.uploader.upload(dataUri, {
              folder: 'uploads_about',
              resource_type: 'image',
            });
          })
        );

        const uploadedImages = uploadedResults.map((item, index) => ({
          url: item.secure_url,
          alt: uploadedFiles[index].originalname || '',
        }));

        parsedImages = [...parsedImages, ...uploadedImages];
      }

      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        about.images = parsedImages;
      }

      if (!Array.isArray(about.images) || about.images.length === 0) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh');
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
