import Product from '../models/data/Product.js';
import Category from '../models/data/Category.js';
import Order from '../models/data/Order.js';
import cloudinary from '../configs/cloudinary.js';
import mongoose from 'mongoose';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const ProductController = {
  // Tạo sản phẩm (admin)
  create: async (req, res) => {
    try {
      const {
        name,
        description,
        categories,
        images,
        thumbnail,
        specifications,
        comments,
      } = req.body;

      const price = Number(req.body.price);
      const sale =
        req.body.sale !== undefined &&
        req.body.sale !== null &&
        req.body.sale !== ''
          ? Number(req.body.sale)
          : undefined;
      const stock = Number(req.body.stock);
      const status =
        req.body.status !== undefined &&
        req.body.status !== null &&
        req.body.status !== ''
          ? Number(req.body.status)
          : undefined;
      const rating =
        req.body.rating !== undefined &&
        req.body.rating !== null &&
        req.body.rating !== ''
          ? Number(req.body.rating)
          : undefined;

      let parsedCategories = [];
      if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch {
          return handleError400(res, 'Categories không đúng định dạng JSON');
        }
      }

      let parsedImages = [];
      if (Array.isArray(images)) {
        parsedImages = images;
      } else if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch {
          parsedImages = [];
        }
      }

      let parsedThumbnail = thumbnail;
      if (typeof thumbnail === 'string') {
        try {
          parsedThumbnail = JSON.parse(thumbnail);
        } catch {
          parsedThumbnail = { url: thumbnail, alt: '' };
        }
      }

      let parsedSpecifications = {};
      if (specifications && typeof specifications === 'object') {
        parsedSpecifications = specifications;
      } else if (typeof specifications === 'string') {
        try {
          parsedSpecifications = JSON.parse(specifications);
        } catch {
          parsedSpecifications = {};
        }
      }

      let parsedComments = [];
      if (Array.isArray(comments)) {
        parsedComments = comments;
      } else if (typeof comments === 'string') {
        try {
          parsedComments = JSON.parse(comments);
        } catch {
          parsedComments = [];
        }
      }

      const uploadedFiles = req.files || [];
      if (uploadedFiles.length) {
        const uploadedResults = await Promise.all(
          uploadedFiles.map(file => {
            const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinary.uploader.upload(dataUri, {
              folder: 'uploads_audio',
              resource_type: 'auto',
            });
          })
        );

        const uploadedImages = uploadedResults.map((item, index) => ({
          url: item.secure_url,
          alt: uploadedFiles[index].originalname,
        }));

        parsedImages = [...parsedImages, ...uploadedImages];

        if (!parsedThumbnail && uploadedImages.length) {
          parsedThumbnail = uploadedImages[0];
        }
      }

      // kiểm tra categories tồn tại
      const foundCategories = await Category.find({
        _id: { $in: parsedCategories },
        isDelete: false,
      }).select('_id');

      if (!foundCategories.length) {
        return handleError400(res, 'Category không hợp lệ');
      }

      if (foundCategories.length !== parsedCategories.length) {
        return handleError400(
          res,
          'Một số category không tồn tại hoặc đã bị xóa'
        );
      }

      const product = await Product.create({
        name,
        price,
        sale,
        stock,
        status,
        description,
        rating,
        categories: foundCategories.map(c => c._id),
        images: parsedImages,
        thumbnail: parsedThumbnail,
        specifications: parsedSpecifications,
        comments: parsedComments,
      });

      return handleSuccess201(res, 'Tạo sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Cập nhật sản phẩm (admin)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const product = await Product.findById(id);
      if (!product || product.isDelete) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      if (updateData.name) {
        product.name = updateData.name;
      }

      if (updateData.categories) {
        const foundCategories = await Category.find({
          _id: { $in: updateData.categories },
          isDelete: false,
        }).select('_id');

        if (!foundCategories.length) {
          return handleError400(res, 'Category không hợp lệ');
        }

        if (foundCategories.length !== updateData.categories.length) {
          return handleError400(
            res,
            'Một số category không tồn tại hoặc đã bị xóa'
          );
        }

        product.categories = foundCategories.map(c => c._id);
      }

      if (typeof updateData.price !== 'undefined')
        product.price = updateData.price;
      if (typeof updateData.sale !== 'undefined')
        product.sale = updateData.sale;
      if (typeof updateData.stock !== 'undefined')
        product.stock = updateData.stock;
      if (typeof updateData.status !== 'undefined')
        product.status = updateData.status;
      if (typeof updateData.description !== 'undefined')
        product.description = updateData.description;
      if (typeof updateData.rating !== 'undefined')
        product.rating = updateData.rating;
      if (typeof updateData.images !== 'undefined')
        product.images = updateData.images;
      if (typeof updateData.thumbnail !== 'undefined')
        product.thumbnail = updateData.thumbnail;
      if (typeof updateData.specifications !== 'undefined')
        product.specifications = updateData.specifications;
      if (typeof updateData.comments !== 'undefined')
        product.comments = updateData.comments;

      await product.save();

      return handleSuccess200(res, 'Cập nhật sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Xóa mềm sản phẩm (admin)
  softDelete: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      if (product.isDelete) {
        return handleError400(res, 'Sản phẩm đã bị xóa trước đó');
      }

      product.isDelete = true;
      await product.save();

      return handleSuccess200(res, 'Xóa sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Khôi phục sản phẩm (admin)
  restore: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      if (!product.isDelete) {
        return handleError400(res, 'Sản phẩm chưa bị xóa');
      }

      product.isDelete = false;
      await product.save();

      return handleSuccess200(res, 'Khôi phục sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: danh sách sản phẩm đã xóa mềm (trash) + tìm kiếm + filter + sort + phân trang
  getDeleted: async (req, res) => {
    try {
      const {
        q,
        status,
        categoryId,
        sortBy = 'deletedAt',
        order = 'desc',
        page = 1,
        limit = 12,
      } = req.query;

      const matchStage = {
        isDelete: true,
      };

      if (q) {
        matchStage.$or = [{ name: { $regex: q, $options: 'i' } }];
      }

      if (status !== undefined) {
        const statusNum = Number(status);
        if (!isNaN(statusNum) && [0, 1, 2].includes(statusNum)) {
          matchStage.status = statusNum;
        }
      }

      if (categoryId) {
        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        matchStage.categories = { $in: [categoryObjectId] };
      }

      const allowedSort = {
        name: 'name',
        price: 'price',
        createdAt: 'createdAt',
        deletedAt: 'updatedAt',
      };

      const sortField = allowedSort[sortBy] || 'updatedAt';
      const sortDirection = order === 'asc' ? 1 : -1;

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: 'categories',
              localField: 'categories',
              foreignField: '_id',
              as: 'categories',
              pipeline: [
                { $match: { isDelete: false } },
                { $project: { _id: 1, name: 1 } },
              ],
            },
          },
          {
            $sort: {
              [sortField]: sortDirection,
              _id: 1,
            },
          },
          { $skip: skip },
          { $limit: limitNum },
        ]),
        Product.countDocuments(matchStage),
      ]);

      return handleSuccess200(res, 'Lấy danh sách sản phẩm đã xóa thành công', {
        items: products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        filter: {
          q: q || null,
          status: status !== undefined ? Number(status) : null,
          categoryId: categoryId || null,
          sortBy: sortField,
          order: sortDirection === 1 ? 'asc' : 'desc',
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: xóa vĩnh viễn sản phẩm khỏi DB
  hardDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      // Chặn xóa cứng nếu sản phẩm đã nằm trong đơn hàng
      const hasOrders = await Order.exists({
        'items.product': id,
      });
      if (hasOrders) {
        return handleError400(
          res,
          'Sản phẩm đã phát sinh đơn hàng, không thể xóa vĩnh viễn'
        );
      }

      await Product.findByIdAndDelete(id);
      return handleSuccess200(
        res,
        'Xóa vĩnh viễn sản phẩm thành công',
        product
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Danh sách sản phẩm (user & admin) + tìm kiếm + filter + sort + phân trang
  getAll: async (req, res) => {
    try {
      const {
        q,
        status,
        categoryId,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 12,
      } = req.query;

      const matchStage = {
        isDelete: false,
      };

      if (q) {
        matchStage.$or = [{ name: { $regex: q, $options: 'i' } }];
      }

      if (status !== undefined) {
        const statusNum = Number(status);
        if (!isNaN(statusNum) && [0, 1, 2].includes(statusNum)) {
          matchStage.status = statusNum;
        }
      }

      if (categoryId) {
        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        matchStage.categories = { $in: [categoryObjectId] };
      }

      const minPriceNum = Number(minPrice);
      const maxPriceNum = Number(maxPrice);

      if (!isNaN(minPriceNum) || !isNaN(maxPriceNum)) {
        matchStage.price = {};

        if (!isNaN(minPriceNum)) {
          matchStage.price.$gte = minPriceNum;
        }

        if (!isNaN(maxPriceNum)) {
          matchStage.price.$lte = maxPriceNum;
        }
      }

      const allowedSort = {
        name: 'name',
        price: 'price',
        createdAt: 'createdAt',
      };

      const sortField = allowedSort[sortBy] || 'createdAt';
      const sortDirection = order === 'asc' ? 1 : -1;

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: 'categories',
              localField: 'categories',
              foreignField: '_id',
              as: 'categories',
              pipeline: [
                { $match: { isDelete: false } },
                { $project: { _id: 1, name: 1 } },
              ],
            },
          },
          {
            $sort: {
              [sortField]: sortDirection,
              _id: 1,
            },
          },
          { $skip: skip },
          { $limit: limitNum },
        ]),
        Product.countDocuments(matchStage),
      ]);

      return handleSuccess200(res, 'Lấy danh sách sản phẩm thành công', {
        items: products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        filter: {
          q: q || null,
          status: status !== undefined ? Number(status) : null,
          categoryId: categoryId || null,
          minPrice: !isNaN(minPriceNum) ? minPriceNum : null,
          maxPrice: !isNaN(maxPriceNum) ? maxPriceNum : null,
          sortBy: sortField,
          order: sortDirection === 1 ? 'asc' : 'desc',
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Chi tiết sản phẩm theo id (user & admin)
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        isDelete: false,
      }).populate({
        path: 'categories',
        match: { isDelete: false },
        select: 'name',
      });

      if (!product) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      return handleSuccess200(res, 'Lấy chi tiết sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Lấy danh sách reviews của sản phẩm
  getReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const product = await Product.findById(id);
      if (!product || product.isDelete) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      const comments = product.comments || [];
      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 10, 1);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedComments = comments.slice(startIndex, endIndex);

      return handleSuccess200(res, 'Lấy danh sách reviews thành công', {
        items: paginatedComments,
        pagination: {
          total: comments.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(comments.length / limitNum),
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Thêm nhiều reviews cho sản phẩm (admin)
  addReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviews } = req.body;

      if (!Array.isArray(reviews)) {
        return handleError400(res, 'Reviews phải là một mảng');
      }

      const product = await Product.findById(id);
      if (!product || product.isDelete) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      const existingComments = product.comments || [];
      product.comments = [...existingComments, ...reviews];
      await product.save();

      return handleSuccess200(res, 'Thêm reviews thành công', product.comments);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Cập nhật toàn bộ reviews của sản phẩm (admin)
  updateReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviews } = req.body;

      if (!Array.isArray(reviews)) {
        return handleError400(res, 'Reviews phải là một mảng');
      }

      const product = await Product.findById(id);
      if (!product || product.isDelete) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      product.comments = reviews;
      await product.save();

      return handleSuccess200(
        res,
        'Cập nhật reviews thành công',
        product.comments
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Xóa một review cụ thể (admin)
  deleteReview: async (req, res) => {
    try {
      const { id, reviewId } = req.params;

      const product = await Product.findById(id);
      if (!product || product.isDelete) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      const comments = product.comments || [];
      const reviewIndex = comments.findIndex(
        review => review._id?.toString() === reviewId || review.id === reviewId
      );

      if (reviewIndex === -1) {
        return handleError404(res, 'Review không tồn tại');
      }

      comments.splice(reviewIndex, 1);
      product.comments = comments;
      await product.save();

      return handleSuccess200(res, 'Xóa review thành công', product.comments);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default ProductController;
