import About from '../models/data/About.js';
import cloudinary from '../configs/cloudinary.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const uploadImageFile = async file => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: 'uploads_about',
    resource_type: 'image',
  });

  return {
    url: uploaded.secure_url,
    alt: file.originalname || '',
  };
};

const parseImagesInput = rawImages => {
  if (Array.isArray(rawImages)) return rawImages;

  if (typeof rawImages === 'string' && rawImages.trim()) {
    try {
      return JSON.parse(rawImages);
    } catch {
      return null;
    }
  }

  return [];
};

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

  // Lấy danh sách about (mỗi about chứa nhiều ảnh)
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 12 } = req.query;
      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        About.find().sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
        About.countDocuments(),
      ]);

      return handleSuccess200(res, 'Lấy danh sách about thành công', {
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

  // Lấy chi tiết 1 about
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const about = await About.findById(id).lean();

      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      return handleSuccess200(res, 'Lấy chi tiết about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Tạo about mới (ít nhất 1 ảnh)
  create: async (req, res) => {
    try {
      const uploadedFiles = req.files || [];
      let parsedImages = parseImagesInput(req.body.images);

      if (parsedImages === null) {
        return handleError400(res, 'images không đúng định dạng JSON');
      }

      if (uploadedFiles.length) {
        const uploadedImages = await Promise.all(
          uploadedFiles.map(file => uploadImageFile(file))
        );
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

  // Cập nhật toàn bộ about (replace danh sách ảnh)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const uploadedFiles = req.files || [];
      let parsedImages = parseImagesInput(req.body.images);

      if (parsedImages === null) {
        return handleError400(res, 'images không đúng định dạng JSON');
      }

      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      if (uploadedFiles.length) {
        const uploadedImages = await Promise.all(
          uploadedFiles.map(file => uploadImageFile(file))
        );
        parsedImages = [...parsedImages, ...uploadedImages];
      }

      if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh');
      }

      about.images = parsedImages;
      await about.save();

      return handleSuccess200(res, 'Cập nhật about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Thêm 1 ảnh vào 1 about có sẵn
  addImage: async (req, res) => {
    try {
      const { id } = req.params;
      const about = await About.findById(id);

      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      const uploadedFiles = req.files || [];
      let images = [];

      if (uploadedFiles.length) {
        images = await Promise.all(
          uploadedFiles.map(file => uploadImageFile(file))
        );
      } else if (req.body.url) {
        images = [
          {
            url: req.body.url,
            alt: req.body.alt || '',
          },
        ];
      }

      if (!images.length) {
        return handleError400(res, 'Vui lòng gửi ảnh cần thêm');
      }

      about.images.push(...images);
      await about.save();

      return handleSuccess200(res, 'Thêm ảnh vào about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Cập nhật 1 ảnh riêng biệt theo index
  updateImage: async (req, res) => {
    try {
      const { id, imageIndex } = req.params;
      const index = Number(imageIndex);

      if (!Number.isInteger(index) || index < 0) {
        return handleError400(res, 'imageIndex không hợp lệ');
      }

      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      if (!about.images[index]) {
        return handleError404(res, 'Ảnh không tồn tại');
      }

      const file = req.files?.[0];
      if (file) {
        const uploadedImage = await uploadImageFile(file);
        about.images[index].url = uploadedImage.url;
        about.images[index].alt = req.body.alt || uploadedImage.alt;
      } else {
        if (typeof req.body.url !== 'undefined') {
          about.images[index].url = req.body.url;
        }
        if (typeof req.body.alt !== 'undefined') {
          about.images[index].alt = req.body.alt;
        }
      }

      await about.save();
      return handleSuccess200(res, 'Cập nhật ảnh about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Xóa 1 ảnh riêng biệt theo index
  removeImage: async (req, res) => {
    try {
      const { id, imageIndex } = req.params;
      const index = Number(imageIndex);

      if (!Number.isInteger(index) || index < 0) {
        return handleError400(res, 'imageIndex không hợp lệ');
      }

      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      if (!about.images[index]) {
        return handleError404(res, 'Ảnh không tồn tại');
      }

      about.images.splice(index, 1);

      if (!about.images.length) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh');
      }

      await about.save();
      return handleSuccess200(res, 'Xóa ảnh about thành công', about);
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
