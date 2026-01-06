import Product from '../models/data/Product.js';
import Category from '../models/data/Category.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError409,
  handleError500,
  generateProductSlug,
} from '../helper/index.js';

const ProductController = {
  // Tạo sản phẩm (admin)
  create: async (req, res) => {
    try {
      const {
        name,
        price,
        sale,
        stock,
        status,
        description,
        sku,
        rating,
        categories,
        images,
        thumbnail,
      } = req.body;

      // kiểm tra categories tồn tại
      const foundCategories = await Category.find({
        _id: { $in: categories },
        isDelete: false,
      }).select('_id');

      if (!foundCategories.length) {
        return handleError400(res, 'Category không hợp lệ');
      }

      if (foundCategories.length !== categories.length) {
        return handleError400(
          res,
          'Một số category không tồn tại hoặc đã bị xóa'
        );
      }

      const slug = generateProductSlug(name, sku, description);

      const existedSlug = await Product.findOne({ slug });
      if (existedSlug) {
        return handleError409(res, 'Sản phẩm đã tồn tại');
      }

      const existedSku = await Product.findOne({ sku });
      if (existedSku) {
        return handleError409(res, 'SKU sản phẩm đã tồn tại');
      }

      const product = await Product.create({
        name,
        slug,
        price,
        sale,
        stock,
        status,
        description,
        sku,
        rating,
        categories: foundCategories.map(c => c._id),
        images,
        thumbnail,
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

      // Nếu có thay đổi name, sku, hoặc description => regenerate slug
      if (
        updateData.name ||
        updateData.sku ||
        typeof updateData.description !== 'undefined'
      ) {
        const newName = updateData.name || product.name;
        const newSku = updateData.sku || product.sku;
        const newDescription = updateData.description ?? product.description;

        const slug = generateProductSlug(newName, newSku, newDescription);
        const existedSlug = await Product.findOne({
          _id: { $ne: id },
          slug,
        });
        if (existedSlug) {
          return handleError409(res, 'Slug sản phẩm đã tồn tại');
        }
        product.slug = slug;
      }

      if (updateData.name) {
        product.name = updateData.name;
      }

      if (updateData.sku && updateData.sku !== product.sku) {
        const existedSku = await Product.findOne({
          _id: { $ne: id },
          sku: updateData.sku,
        });
        if (existedSku) {
          return handleError409(res, 'SKU sản phẩm đã tồn tại');
        }
        product.sku = updateData.sku;
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

  // Danh sách sản phẩm (user & admin) + tìm kiếm + filter
  getAll: async (req, res) => {
    try {
      const { q, status, categoryId } = req.query;

      const matchStage = {
        isDelete: false,
      };

      if (q) {
        matchStage.$or = [
          { name: { $regex: q, $options: 'i' } },
          { slug: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
        ];
      }

      if (status !== undefined) {
        const statusNum = Number(status);
        if (!isNaN(statusNum) && [0, 1, 2].includes(statusNum)) {
          matchStage.status = statusNum;
        }
      }

      if (categoryId) {
        matchStage.categories = { $in: [categoryId] };
      }

      const products = await Product.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'categories',
            localField: 'categories',
            foreignField: '_id',
            as: 'categories',
            pipeline: [
              { $match: { isDelete: false } },
              { $project: { _id: 1, name: 1, slug: 1 } },
            ],
          },
        },
      ]);

      return handleSuccess200(
        res,
        'Lấy danh sách sản phẩm thành công',
        products
      );
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
        select: 'name slug',
      });

      if (!product) {
        return handleError404(res, 'Sản phẩm không tồn tại');
      }

      return handleSuccess200(res, 'Lấy chi tiết sản phẩm thành công', product);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default ProductController;
