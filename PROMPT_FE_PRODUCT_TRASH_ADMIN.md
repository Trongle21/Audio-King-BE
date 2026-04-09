# Prompt FE Vibe Code: Trang San Pham Da Xoa Mem (Trash)

Bạn là Senior Frontend Engineer (React). Hãy implement trang admin riêng để quản lý sản phẩm đã xóa mềm.

Mục tiêu:
- Có trang `ProductTrashPage` riêng.
- Hiển thị danh sách sản phẩm đã soft delete.
- Có 2 action chính cho mỗi item:
  1) Khôi phục (restore)
  2) Xóa vĩnh viễn khỏi DB (hard delete)

---

## 1) Yêu cầu nghiệp vụ

### Trang mới
- Route: `/admin/products/trash`
- Chỉ admin truy cập.
- Có thể điều hướng từ trang product list chính.

### Trạng thái dữ liệu
- Chỉ hiển thị sản phẩm có `isDelete = true`.
- Có tìm kiếm + filter + sort + phân trang.
- UI có loading, empty, error state.

### Hành động
- **Restore**:
  - Confirm trước khi thực hiện.
  - Thành công: remove item khỏi trash list hiện tại.
- **Hard delete**:
  - Confirm mạnh hơn (danger action).
  - Thành công: remove item khỏi trash list.

---

## 2) API contract FE cần dùng

> Dựa trên backend hiện tại đã có:
- `PATCH /api/products/:id/restore` (admin)
- Header token: `token: Bearer <accessToken>`

> Để làm đúng trang Trash, FE cần thêm 2 API backend sau (nếu chưa có):
- `GET /api/products/deleted` (admin) -> list sản phẩm soft-deleted
- `DELETE /api/products/:id/hard` (admin) -> xóa vĩnh viễn

### Shape đề xuất cho `GET /api/products/deleted`
```ts
type DeletedProductsResponse = {
  message: string;
  data: {
    items: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    filter: {
      q: string | null;
      status: number | null;
      categoryId: string | null;
      sortBy: string;
      order: "asc" | "desc";
    };
  };
};
```

---

## 3) Auth convention (quan trọng)

Backend middleware đang đọc token từ header:
```http
token: Bearer <accessToken>
```

Không dùng `Authorization` nếu backend chưa map.

---

## 4) FE architecture

### API layer
Tạo file `src/lib/api/productTrashApi.ts`:
- `getDeletedProducts(params)`
- `restoreProduct(id)`
- `hardDeleteProduct(id)`

### Hooks
Tạo:
- `useDeletedProducts(filters)`
- `useRestoreProduct()`
- `useHardDeleteProduct()`

### Redux (hoặc React Query)
Nếu dùng Redux Toolkit:
- `productTrashSlice`:
  - `items`, `pagination`, `filters`, `loading`, `error`
- actions:
  - `setFilters`
  - `fetchDeletedProducts`
  - `removeDeletedProductLocally` (sau restore/hard delete)

Nếu dùng React Query:
- query key: `["deleted-products", filters]`
- mutation restore/hard-delete invalidate key này.

---

## 5) UI requirements

### Table/List columns
- Thumbnail
- Tên sản phẩm
- Giá
- Stock
- Status
- Deleted time (nếu có)
- Actions: Restore / Delete Permanently

### Filters
- Search `q`
- status
- category
- sortBy (`createdAt | name | price`)
- order (`asc | desc`)
- pagination (`page`, `limit`)

### UX
- Restore button: kiểu secondary
- Hard delete button: kiểu danger
- Có modal confirm:
  - restore confirm
  - hard delete confirm (nội dung cảnh báo không thể hoàn tác)

---

## 6) Zod + React Hook Form

Dùng `react-hook-form` + `zodResolver` cho form filter:

```ts
import { z } from "zod";

export const productTrashFilterSchema = z.object({
  q: z.string().optional(),
  status: z.union([z.literal(""), z.literal("0"), z.literal("1"), z.literal("2")]).optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "price"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
```

---

## 7) Flow chi tiết

1. Vào `/admin/products/trash` -> load list deleted products.
2. User filter/search -> refetch theo query mới.
3. User bấm Restore:
   - confirm
   - call `PATCH /api/products/:id/restore`
   - success: toast + update list
4. User bấm Hard Delete:
   - confirm danger
   - call `DELETE /api/products/:id/hard`
   - success: toast + update list

---

## 8) Error handling

Ưu tiên message từ backend:
- `error.response?.data?.message`
- fallback: `"Có lỗi xảy ra, vui lòng thử lại"`

Không crash UI khi request fail.

---

## 9) File structure gợi ý

- `src/pages/admin/ProductTrashPage.tsx`
- `src/components/admin/products/ProductTrashTable.tsx`
- `src/components/admin/products/ProductTrashFilters.tsx`
- `src/components/admin/products/ProductTrashActions.tsx`
- `src/lib/api/productTrashApi.ts`
- `src/hooks/useDeletedProducts.ts`
- `src/hooks/useRestoreProduct.ts`
- `src/hooks/useHardDeleteProduct.ts`
- `src/validation/productTrashFilterSchema.ts`

---

## 10) Acceptance criteria

1. Có route admin `/admin/products/trash`.
2. Hiển thị đúng danh sách sản phẩm đã soft delete.
3. Có filter/search/sort/pagination hoạt động.
4. Restore hoạt động và item biến mất khỏi trash list.
5. Hard delete hoạt động và item biến mất khỏi trash list.
6. Có loading/empty/error state đầy đủ.
7. Header token gửi đúng key `token`.

