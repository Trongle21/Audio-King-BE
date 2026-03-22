import z from 'zod';

const trendingItemSchema = z.object({
  productId: z.string().min(1, 'productId không hợp lệ'),
  priority: z
    .number({ invalid_type_error: 'Priority phải là số' })
    .int('Priority phải là số nguyên')
    .min(0, 'Priority không được âm'),
});

const updateTrendingSchema = z.object({
  items: z
    .array(trendingItemSchema)
    .min(1, 'Danh sách trending không được trống'),
});

export { updateTrendingSchema };
