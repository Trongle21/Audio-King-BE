import z from 'zod';

const deleteAboutImagesSchema = z
  .object({
    indices: z.array(z.number().int().min(0)).optional(),
    publicIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    data => {
      const indicesCount = data.indices?.length ?? 0;
      const publicIdsCount = data.publicIds?.length ?? 0;
      return indicesCount + publicIdsCount > 0;
    },
    { message: 'Phải cung cấp ít nhất 1 `indices` hoặc `publicIds`' }
  );

export { deleteAboutImagesSchema };
