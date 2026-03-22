import z from 'zod';

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const orderItemSchema = z.object({
  productId: z.string().min(1, 'productId không hợp lệ'),
  quantity: z
    .number({ invalid_type_error: 'Số lượng phải là số' })
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1'),
});

const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Tên khách hàng phải có ít nhất 2 ký tự')
    .max(100, 'Tên khách hàng không được quá 100 ký tự'),
  phone: z.string().regex(PHONE_REGEX, 'Số điện thoại không hợp lệ'),
  address: z
    .string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(255, 'Địa chỉ không được quá 255 ký tự'),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
  items: z.array(orderItemSchema).min(1, 'Giỏ hàng không được trống'),
});

export { createOrderSchema };
