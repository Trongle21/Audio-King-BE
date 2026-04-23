import z from 'zod';

import { PRODUCT_STATUS_VALUES } from '../enums/status.js';

const IMAGE_SCHEMA = z.object({
  url: z.string().url('Ảnh phải là URL hợp lệ'),
  alt: z.string().max(255).optional(),
});

const REVIEW_SCHEMA = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating phải là số' })
    .min(1, 'Rating tối thiểu là 1 sao')
    .max(5, 'Rating tối đa là 5 sao')
    .default(5),
  review: z
    .string()
    .max(500, 'Đánh giá không được quá 500 ký tự')
    .optional()
    .default(''),
});

const productBase = {
  name: z
    .string()
    .min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự')
    .max(100, 'Tên sản phẩm không được quá 100 ký tự'),
  price: z
    .number({ invalid_type_error: 'Giá phải là số' })
    .nonnegative('Giá không được âm'),
  sale: z
    .number({ invalid_type_error: 'Giá sale phải là số' })
    .min(0, 'Sale không được âm')
    .max(100, 'Sale không được lớn hơn 100%')
    .nullable()
    .optional(),
  stock: z
    .number({ invalid_type_error: 'Số lượng phải là số' })
    .int('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không được âm'),
  status: z
    .number({ invalid_type_error: 'Trạng thái phải là số' })
    .int('Trạng thái phải là số nguyên')
    .refine(
      val => PRODUCT_STATUS_VALUES.includes(val),
      'Trạng thái không hợp lệ'
    )
    .optional(),
  description: z.string().max(2000).optional(),
  rating: z
    .number({ invalid_type_error: 'Rating phải là số' })
    .min(0, 'Rating không được âm')
    .max(5, 'Rating tối đa là 5')
    .optional(),
  categories: z
    .array(z.string().min(1, 'CategoryId không hợp lệ'))
    .min(1, 'Sản phẩm phải thuộc ít nhất 1 category'),
  images: z.array(IMAGE_SCHEMA).min(1, 'Sản phẩm phải có ít nhất 1 ảnh'),
  thumbnail: IMAGE_SCHEMA,
  reviews: z.array(REVIEW_SCHEMA).optional().default([]),
};

const createProductSchema = z.object(productBase);

const updateProductSchema = z
  .object({
    ...productBase,
  })
  .partial();

const addReviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating phải là số' })
    .min(1, 'Rating tối thiểu là 1 sao')
    .max(5, 'Rating tối đa là 5 sao')
    .default(5),
  review: z
    .string()
    .max(500, 'Đánh giá không được quá 500 ký tự')
    .optional()
    .default(''),
});

export { createProductSchema, updateProductSchema, addReviewSchema };
