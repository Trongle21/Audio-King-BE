import Banner from '../models/data/Banner.js';
import cloudinary from '../configs/cloudinary.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const uploadFilesToBannerImages = async uploadedFiles => {
  const uploadedResults = await Promise.all(
    uploadedFiles.map(file => {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return cloudinary.uploader.upload(dataUri, {
        folder: 'uploads_audio',
        resource_type: 'auto',
      });
    })
  );

  return uploadedResults.map((item, index) => ({
    url: item.secure_url,
    alt: uploadedFiles[index].originalname,
    publicId: item.public_id,
    resourceType: item.resource_type || 'image',
  }));
};

// Singleton banner (chỉ giữ lại 1 document trong collection).
const getSingletonBanner = async () => {
  return await Banner.findOne().sort({ updatedAt: -1 }).exec();
};

const ensureSingleton = async keepId => {
  await Banner.deleteMany({ _id: { $ne: keepId } });
};

const BannerController = {
  getAll: async (_req, res) => {
    try {
      const banner = await getSingletonBanner();
      // Contract FE vẫn nhận array, nhưng array chỉ có tối đa 1 phần tử.
      return handleSuccess200(
        res,
        'Lấy danh sách banner thành công',
        banner ? [banner] : []
      );
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

      const images = await uploadFilesToBannerImages(uploadedFiles);

      const existing = await getSingletonBanner();
      if (existing) {
        existing.images = images;
        await existing.save();
        await ensureSingleton(existing._id);
        return handleSuccess201(res, 'Tạo banner thành công', existing);
      }

      const banner = await Banner.create({ images });
      await ensureSingleton(banner._id);
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

      const images = await uploadFilesToBannerImages(uploadedFiles);
      banner.images = images;

      await banner.save();
      await ensureSingleton(banner._id);
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

      await Banner.deleteMany({ _id: { $ne: id } });
      await Banner.findByIdAndDelete(id);
      return handleSuccess200(res, 'Xóa banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Singleton: thêm ảnh vào cuối `banner.images`
  addImages: async (req, res) => {
    try {
      const uploadedFiles = req.files || [];
      if (!uploadedFiles.length) {
        return handleError400(res, 'Vui lòng upload ít nhất 1 ảnh banner');
      }

      const images = await uploadFilesToBannerImages(uploadedFiles);

      let banner = await getSingletonBanner();
      if (!banner) {
        banner = await Banner.create({ images });
      } else {
        banner.images = [...(banner.images || []), ...images];
        await banner.save();
      }

      await ensureSingleton(banner._id);
      return handleSuccess200(res, 'Thêm ảnh banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Singleton: thay thế nhiều ảnh theo index trong `banner.images`
  // Request (multipart/form-data):
  // - files: array field name = `files`
  // - indices: stringified JSON array, ví dụ: "[0,2,3]"
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

      let banner = await getSingletonBanner();
      if (!banner) {
        // Cho phép tạo mới banner nếu indices hợp lệ cho mảng rỗng.
        banner = await Banner.create({ images: [] });
      }

      // Validation index phải tồn tại trong current images array.
      const maxIndex = Math.max(...parsedIndices);
      if (maxIndex >= (banner.images || []).length) {
        return handleError400(
          res,
          'Một hoặc nhiều `indices` vượt quá độ dài banner hiện tại'
        );
      }

      const images = await uploadFilesToBannerImages(uploadedFiles);

      parsedIndices.forEach((index, i) => {
        banner.images[index] = images[i];
      });

      await banner.save();
      await ensureSingleton(banner._id);
      return handleSuccess200(
        res,
        'Cập nhật ảnh banner theo index thành công',
        banner
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Singleton: xóa ảnh trong `banner.images`
  // Request (json):
  // { indices?: number[], publicIds?: string[] }
  deleteImages: async (req, res) => {
    try {
      const { indices, publicIds } = req.body;

      const banner = await getSingletonBanner();
      if (!banner) {
        return handleError404(res, 'Banner không tồn tại');
      }

      // Delete by publicIds (stable)
      if (Array.isArray(publicIds) && publicIds.length) {
        const toDelete = (banner.images || []).filter(
          img => img.publicId && publicIds.includes(img.publicId)
        );

        // Cloudinary delete best-effort (không chặn xóa trong DB nếu destroy fail)
        await Promise.all(
          toDelete.map(img =>
            cloudinary.uploader
              .destroy(img.publicId, {
                resource_type: img.resourceType || 'image',
              })
              .catch(() => null)
          )
        );

        banner.images = (banner.images || []).filter(
          img => !img.publicId || !publicIds.includes(img.publicId)
        );
      }

      // Delete by indices
      if (Array.isArray(indices) && indices.length) {
        const sorted = [...indices].sort((a, b) => b - a);
        if (sorted.some(idx => idx < 0 || idx >= banner.images.length)) {
          return handleError400(res, 'Một hoặc nhiều index không hợp lệ');
        }

        sorted.forEach(idx => {
          banner.images.splice(idx, 1);
        });
      }

      await banner.save();
      await ensureSingleton(banner._id);
      return handleSuccess200(res, 'Xóa ảnh banner thành công', banner);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default BannerController;
