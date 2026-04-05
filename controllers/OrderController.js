import Product from '../models/data/Product.js';
import Order from '../models/data/Order.js';
import User from '../models/data/User.js';
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

        const thumbnailUrl =
          typeof product.thumbnail === 'string'
            ? product.thumbnail
            : product.thumbnail?.url || '';

        orderItems.push({
          product: product._id,
          name: product.name,
          thumbnail: thumbnailUrl,
          quantity: cartItem.quantity,
          unitPrice: product.price,
          sale,
          finalPrice,
          lineTotal,
        });
      }

      const shippingFee = 0;
      const total = subtotal + shippingFee;

      const normalizedPhone = String(phone || '').trim();
      const linkedUser = await User.findOne({
        phone: normalizedPhone,
        isDelete: false,
      })
        .select('_id')
        .lean();

      const order = await Order.create({
        user: linkedUser?._id || null,
        customerName,
        phone: normalizedPhone,
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
      const { page = 1, limit = 12, status, paymentStatus } = req.query;

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 12, 1);
      const skip = (pageNum - 1) * limitNum;

      const matchStage = {};
      if (status) {
        matchStage.status = status;
      }
      if (paymentStatus) {
        matchStage.paymentStatus = paymentStatus;
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
          paymentStatus: paymentStatus || null,
        },
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: cập nhật trạng thái thanh toán
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      if (!['unpaid', 'paid'].includes(paymentStatus)) {
        return handleError400(
          res,
          "paymentStatus phải là 'unpaid' hoặc 'paid'"
        );
      }

      const order = await Order.findById(id);
      if (!order) {
        return handleError404(res, 'Đơn hàng không tồn tại');
      }

      order.paymentStatus = paymentStatus;
      order.paidAt = paymentStatus === 'paid' ? new Date() : null;

      await order.save();

      return handleSuccess200(
        res,
        'Cập nhật trạng thái thanh toán thành công',
        order
      );
    } catch (error) {
      return handleError500(res, error);
    }
  },

  // Admin: xóa đơn hàng
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) {
        return handleError404(res, 'Đơn hàng không tồn tại');
      }

      await Order.findByIdAndDelete(id);

      return handleSuccess200(res, 'Xóa đơn hàng thành công', order);
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default OrderController;
