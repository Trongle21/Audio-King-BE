import About from '../models/data/About.js';
import cloudinary from '../configs/cloudinary.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const uploadFilesToAboutImages = async uploadedFiles => {
  const uploadedResults = await Promise.all(
    uploadedFiles.map(file => {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return cloudinary.uploader.upload(dataUri, {
        folder: 'uploads_about',
        resource_type: 'image',
      });
    })
  );

  return uploadedResults.map((item, index) => ({
    url: item.secure_url,
    alt: uploadedFiles[index].originalname || '',
    publicId: item.public_id,
    resourceType: item.resource_type || 'image',
  }));
};

const getSingletonAbout = async () => {
  return await About.findOne().sort({ updatedAt: -1 }).exec();
};

const ensureSingleton = async keepId => {
  await About.deleteMany({ _id: { $ne: keepId } });
};

const AboutController = {
  getAll: async (_req, res) => {
    try {
      const about = await getSingletonAbout();
      return handleSuccess200(
        res,
        'Lấy danh sách about thành công',
        about ? [about] : []
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  create: async (req, res) => {
    try {
      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'About phải có ít nhất 1 ảnh upload');
      }

      const images = await uploadFilesToAboutImages(uploadedFiles);
      const existing = await getSingletonAbout();

      if (existing) {
        existing.images = images;
        await existing.save();
        await ensureSingleton(existing._id);
        return handleSuccess201(res, 'Tạo about thành công', existing);
      }

      const about = await About.create({ images });
      await ensureSingleton(about._id);
      return handleSuccess201(res, 'Tạo about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const about = await About.findById(id);
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'Vui lòng upload ảnh about để cập nhật');
      }

      const images = await uploadFilesToAboutImages(uploadedFiles);
      about.images = images;
      await about.save();
      await ensureSingleton(about._id);
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

      await About.deleteMany({ _id: { $ne: id } });
      await About.findByIdAndDelete(id);
      return handleSuccess200(res, 'Xóa about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  addImages: async (req, res) => {
    try {
      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'Vui lòng upload ít nhất 1 ảnh about');
      }

      const images = await uploadFilesToAboutImages(uploadedFiles);

      let about = await getSingletonAbout();
      if (!about) {
        about = await About.create({ images });
      } else {
        about.images = [...(about.images || []), ...images];
        await about.save();
      }

      await ensureSingleton(about._id);
      return handleSuccess200(res, 'Thêm ảnh about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  replaceImagesByIndices: async (req, res) => {
    try {
      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'Vui lòng upload ảnh để thay thế');
      }

      const { indices } = req.body;
      if (!indices) {
        return handleError400(res, 'Thiếu `indices` để thay thế ảnh');
      }

      let parsedIndices;
      try {
        parsedIndices =
          typeof indices === 'string' ? JSON.parse(indices) : indices;
      } catch {
        return handleError400(res, '`indices` không đúng định dạng JSON');
      }

      if (!Array.isArray(parsedIndices) || parsedIndices.length === 0) {
        return handleError400(res, '`indices` phải là mảng số nguyên >= 0');
      }

      if (
        parsedIndices.some(
          idx => !Number.isInteger(idx) || Number(idx) < 0 || idx === null
        )
      ) {
        return handleError400(res, '`indices` chứa giá trị không hợp lệ');
      }

      if (uploadedFiles.length !== parsedIndices.length) {
        return handleError400(
          res,
          '`files` phải có cùng số lượng với `indices`'
        );
      }

      let about = await getSingletonAbout();
      if (!about) {
        about = await About.create({ images: [] });
      }

      const maxIndex = Math.max(...parsedIndices);
      if (maxIndex >= (about.images || []).length) {
        return handleError400(
          res,
          'Một hoặc nhiều `indices` vượt quá độ dài about hiện tại'
        );
      }

      const images = await uploadFilesToAboutImages(uploadedFiles);
      parsedIndices.forEach((index, i) => {
        about.images[index] = images[i];
      });

      await about.save();
      await ensureSingleton(about._id);
      return handleSuccess200(
        res,
        'Cập nhật ảnh about theo index thành công',
        about
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  deleteImages: async (req, res) => {
    try {
      const { indices, publicIds } = req.body;
      const about = await getSingletonAbout();
      if (!about) {
        return handleError404(res, 'About không tồn tại');
      }

      if (Array.isArray(publicIds) && publicIds.length) {
        const toDelete = (about.images || []).filter(
          img => img.publicId && publicIds.includes(img.publicId)
        );

        await Promise.all(
          toDelete.map(img =>
            cloudinary.uploader
              .destroy(img.publicId, {
                resource_type: img.resourceType || 'image',
              })
              .catch(() => null)
          )
        );

        about.images = (about.images || []).filter(
          img => !img.publicId || !publicIds.includes(img.publicId)
        );
      }

      if (Array.isArray(indices) && indices.length) {
        const sorted = [...indices].sort((a, b) => b - a);
        if (sorted.some(idx => idx < 0 || idx >= about.images.length)) {
          return handleError400(res, 'Một hoặc nhiều index không hợp lệ');
        }

        sorted.forEach(idx => {
          about.images.splice(idx, 1);
        });
      }

      await about.save();
      await ensureSingleton(about._id);
      return handleSuccess200(res, 'Xóa ảnh about thành công', about);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default AboutController;
