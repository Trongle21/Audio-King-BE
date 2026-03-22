import Trending from '../models/data/Trending.js';
import Product from '../models/data/Product.js';
import {
  handleSuccess200,
  handleError400,
  handleError500,
} from '../helper/index.js';

const TrendingController = {
  // Lấy danh sách trending (public)
  getAll: async (_req, res) => {
    try {
      const trendingList = await Trending.find()
        .sort({ priority: 1, updatedAt: -1 })
        .populate({
          path: 'product',
          match: { isDelete: false },
          select: 'name slug price sale stock status description sku rating images thumbnail',
        })
        .lean();

      const data = trendingList
        .filter(item => item.product)
        .map(item => ({
          _id: item._id,
          productId: item.product._id,
          priority: item.priority,
          product: item.product,
        }));

      return handleSuccess200(res, 'Lấy danh sách trending thành công', data);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: cập nhật toàn bộ thứ tự trending theo list frontend gửi lên
  updatePriority: async (req, res) => {
    try {
      const { items } = req.body;

      const productIds = items.map(item => item.productId);
      const uniqueProductIds = [...new Set(productIds)];

      if (uniqueProductIds.length !== productIds.length) {
        return handleError400(res, 'Danh sách productId bị trùng');
      }

      const products = await Product.find({
        _id: { $in: uniqueProductIds },
        isDelete: false,
      }).select('_id');

      if (products.length !== uniqueProductIds.length) {
        return handleError400(
          res,
          'Một số sản phẩm không tồn tại hoặc đã bị xóa'
        );
      }

      await Trending.deleteMany({});

      await Trending.insertMany(
        items.map(item => ({
          product: item.productId,
          priority: item.priority,
        }))
      );

      const trendingList = await Trending.find()
        .sort({ priority: 1, updatedAt: -1 })
        .populate({
          path: 'product',
          match: { isDelete: false },
          select: 'name slug price sale stock status description sku rating images thumbnail',
        })
        .lean();

      const data = trendingList
        .filter(item => item.product)
        .map(item => ({
          _id: item._id,
          productId: item.product._id,
          priority: item.priority,
          product: item.product,
        }));

      return handleSuccess200(res, 'Cập nhật thứ tự trending thành công', data);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default TrendingController;
