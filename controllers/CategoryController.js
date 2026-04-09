import Category from '../models/data/Category.js';
import Product from '../models/data/Product.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
  handleError409,
  generateCategorySlug,
} from '../helper/index.js';

const CategoryController = {
  // Tạo category mới, slug chuẩn SEO (admin)
  create: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return handleError400(res, 'Tên category không được để trống');
      }

      const slug = generateCategorySlug(name);

      const existing = await Category.findOne({ slug });
      if (existing) {
        return handleError409(res, 'Category đã tồn tại');
      }

      const category = await Category.create({
        name,
        slug,
      });

      return handleSuccess201(res, 'Tạo category thành công', category);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Cập nhật category (admin) - có hỗ trợ đổi tên => đổi slug SEO
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const category = await Category.findById(id);
      if (!category || category.isDelete) {
        return handleError404(res, 'Category không tồn tại');
      }

      if (name) {
        const slug = generateCategorySlug(name);
        const existing = await Category.findOne({
          _id: { $ne: id },
          slug,
        });
        if (existing) {
          return handleError409(res, 'Category với tên này đã tồn tại');
        }
        category.name = name;
        category.slug = slug;
      }

      await category.save();
      return handleSuccess200(res, 'Cập nhật category thành công', category);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Xóa mềm category (admin) - nếu có sản phẩm liên quan thì không cho xóa
  softDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return handleError404(res, 'Category không tồn tại');
      }

      const hasProducts = await Product.exists({
        categories: id,
        isDelete: false,
      });

      if (hasProducts) {
        return handleError400(
          res,
          'Category đang có sản phẩm liên quan, không thể xóa'
        );
      }

      if (category.isDelete) {
        return handleError400(res, 'Category đã bị xóa trước đó');
      }

      category.isDelete = true;
      await category.save();

      return handleSuccess200(res, 'Xóa category thành công', category);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Khôi phục category (admin)
  restore: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return handleError404(res, 'Category không tồn tại');
      }

      if (!category.isDelete) {
        return handleError400(res, 'Category chưa bị xóa');
      }

      category.isDelete = false;
      await category.save();

      return handleSuccess200(res, 'Khôi phục category thành công', category);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Xóa vĩnh viễn category khỏi DB (admin)
  hardDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return handleError404(res, 'Category không tồn tại');
      }

      // Chặn xóa cứng nếu còn product đang tham chiếu category này
      const hasAnyProducts = await Product.exists({
        categories: id,
      });

      if (hasAnyProducts) {
        return handleError400(
          res,
          'Category đang có sản phẩm liên quan, không thể xóa vĩnh viễn'
        );
      }

      await Category.findByIdAndDelete(id);
      return handleSuccess200(
        res,
        'Xóa vĩnh viễn category thành công',
        category
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Lấy danh sách category + products (user & admin) + tìm kiếm + phân trang
  getAllWithProducts: async (req, res) => {
    try {
      const { q, page = 1, limit = 12 } = req.query;

      const matchStage = {
        isDelete: false,
      };

      if (q) {
        matchStage.$or = [
          { name: { $regex: q, $options: 'i' } },
          { slug: { $regex: q, $options: 'i' } },
        ];
      }

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const [categories, total] = await Promise.all([
        Category.aggregate([
          {
            $match: matchStage,
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: 'categories',
              as: 'products',
              pipeline: [
                { $match: { isDelete: false } },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    price: 1,
                    description: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
              isDelete: 1,
              products: 1,
            },
          },
          { $sort: { createdAt: -1, _id: 1 } },
          { $skip: skip },
          { $limit: limitNum },
        ]),
        Category.countDocuments(matchStage),
      ]);

      return handleSuccess200(
        res,
        'Lấy danh sách category kèm sản phẩm thành công',
        {
          items: categories,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
          filter: {
            q: q || null,
          },
        }
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Lấy chi tiết category theo id (user & admin)
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findOne({
        _id: id,
        isDelete: false,
      }).lean();

      if (!category) {
        return handleError404(res, 'Category không tồn tại');
      }

      const products = await Product.find({
        categories: { $in: [id] },
        isDelete: false,
      }).select('name slug price description thumbnail');

      return handleSuccess200(res, 'Lấy chi tiết category thành công', {
        ...category,
        products,
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default CategoryController;
