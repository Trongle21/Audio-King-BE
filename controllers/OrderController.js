import Product from '../models/data/Product.js';
import Order from '../models/data/Order.js';
import {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError500,
} from '../helper/index.js';

const OrderController = {
  // Guest checkout: nhận thông tin khách + items từ local cart của frontend
  create: async (req, res) => {
    try {
      const { customerName, phone, address, note = '', items } = req.body;

      const productIds = items.map(item => item.productId);

      const products = await Product.find({
        _id: { $in: productIds },
        isDelete: false,
      }).lean();

      if (!products.length) {
        return handleError400(res, 'Giỏ hàng không hợp lệ');
      }

      if (products.length !== productIds.length) {
        return handleError400(
          res,
          'Một số sản phẩm không tồn tại hoặc đã bị xóa'
        );
      }

      const productMap = new Map(
        products.map(product => [String(product._id), product])
      );

      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of items) {
        const product = productMap.get(cartItem.productId);

        if (!product) {
          return handleError404(res, 'Sản phẩm không tồn tại');
        }

        if (product.stock < cartItem.quantity) {
          return handleError400(
            res,
            `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho`
          );
        }

        const sale = typeof product.sale === 'number' ? product.sale : null;
        const finalPrice =
          sale !== null
            ? Math.round(product.price * (1 - sale / 100))
            : product.price;
        const lineTotal = finalPrice * cartItem.quantity;

        subtotal += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          thumbnail: product.thumbnail,
          quantity: cartItem.quantity,
          unitPrice: product.price,
          sale,
          finalPrice,
          lineTotal,
        });
      }

      const shippingFee = 0;
      const total = subtotal + shippingFee;

      const order = await Order.create({
        customerName,
        phone,
        address,
        note,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
      });

      return handleSuccess201(res, 'Tạo đơn hàng thành công', order);
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: xem danh sách đơn hàng
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 12, status } = req.query;

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const matchStage = {};
      if (status) {
        matchStage.status = status;
      }

      const [orders, total] = await Promise.all([
        Order.find(matchStage)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(matchStage),
      ]);

      return handleSuccess200(res, 'Lấy danh sách đơn hàng thành công', {
        items: orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        filter: {
          status: status || null,
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default OrderController;
