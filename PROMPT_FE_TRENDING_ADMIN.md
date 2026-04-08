# Prompt FE Admin: Quản lý Trending (search/filter product + drag & drop ưu tiên)

Bạn là Senior Frontend Engineer (React). Hãy xây màn Admin để quản lý danh sách Trending theo backend hiện có:
- Lấy toàn bộ product có tìm kiếm/lọc.
- Kéo thả product vào danh sách Trending.
- Sắp xếp thứ tự ưu tiên.
- Lưu toàn bộ thứ tự về API.

## 1) API contract bắt buộc

### A. Lấy danh sách product để chọn
- **Method**: `GET`
- **URL**: `/api/products`
- **Auth**: không bắt buộc (nhưng admin page có thể vẫn login)
- **Query hỗ trợ từ BE**:
  - `q`: search theo tên
  - `status`: `0 | 1 | 2`
  - `categoryId`
  - `minPrice`, `maxPrice`
  - `sortBy`: `name | price | createdAt`
  - `order`: `asc | desc`
  - `page`, `limit`

Response:

```ts
type ProductListResponse = {
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
      minPrice: number | null;
      maxPrice: number | null;
      sortBy: string;
      order: "asc" | "desc";
    };
  };
};
```

### B. Lấy danh sách trending hiện tại (public)
- **Method**: `GET`
- **URL**: `/api/trending`
- **Auth**: không cần token

Response:

```ts
type TrendingItem = {
  _id: string;
  productId: string;
  priority: number;
  product: Product;
};

type TrendingListResponse = {
  message: string;
  data: TrendingItem[];
};
```

### C. Cập nhật toàn bộ thứ tự trending (admin)
- **Method**: `PUT`
- **URL**: `/api/trending`
- **Auth**: bắt buộc admin
- **Header token BE yêu cầu**: `token: Bearer <accessToken>`
- **Body**:

```ts
type UpdateTrendingBody = {
  items: Array<{
    productId: string;
    priority: number; // int >= 0
  }>;
};
```

Validation từ BE:
- `items` phải có ít nhất 1 phần tử.
- `productId` không được trùng nhau.
- product phải tồn tại và chưa xóa.

Response success (200):
- `{ message: 'Cập nhật thứ tự trending thành công', data: TrendingItem[] }`

## 2) Mục tiêu UI Admin

Trang `Trending Admin` gồm 2 cột:

1. **Product Source List** (bên trái)
   - Danh sách product từ `/api/products`
   - Có search + filter + sort + pagination
   - Mỗi card có nút "Add to Trending"

2. **Trending Target List** (bên phải)
   - Danh sách trending hiện tại
   - Kéo thả để đổi vị trí
   - Có nút remove item khỏi trending
   - Hiển thị `priority` theo thứ tự hiện tại (0,1,2,...)

## 3) Logic nghiệp vụ FE cần implement

### Load ban đầu
1. Fetch `/api/trending` -> dựng `selectedTrending`.
2. Fetch `/api/products` theo filter mặc định.

### Chọn sản phẩm vào trending
- Khi bấm Add hoặc drag từ source sang target:
  - Nếu product đã có trong trending -> không add trùng (show toast).
  - Nếu chưa có -> push vào cuối danh sách.
  - Recompute priority toàn bộ theo index.

### Kéo thả sắp xếp
- Dùng `dnd-kit` hoặc `react-beautiful-dnd`.
- Sau mỗi lần reorder:
  - Cập nhật thứ tự list trong state.
  - Recompute `priority = index`.

### Lưu về backend
- Khi bấm "Save Trending":
  - Build payload:

```ts
const payload = {
  items: trendingList.map((item, index) => ({
    productId: item.productId,
    priority: index,
  })),
};
```

  - Gọi `PUT /api/trending` với admin token header kiểu `token`.
  - Success: cập nhật lại local state từ `response.data`.
  - Error: show message BE.

## 4) Tech requirements (hooks + api + zod + form)

### Zod schema cho filter form (search/lọc)
Tạo schema cho filter:

```ts
import { z } from "zod";

export const productFilterSchema = z.object({
  q: z.string().optional(),
  status: z.union([z.literal(""), z.literal("0"), z.literal("1"), z.literal("2")]).optional(),
  categoryId: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "price"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
```

### React Hook Form
- Dùng `react-hook-form` + `zodResolver(productFilterSchema)` cho form filter/search.
- Submit filter -> fetch lại `/api/products` với query params.
- Có nút Reset filter.

### Hooks đề xuất
- `useProducts(params)` -> load danh sách product theo filter/search.
- `useTrending()` -> load trending hiện tại.
- `useUpdateTrending()` -> submit PUT.

### Redux state đề xuất
- `trendingAdminSlice`:
  - `availableProducts`
  - `availablePagination`
  - `selectedTrending`
  - `isDirty` (chưa lưu)
  - `loading`, `saving`, `error`
- Actions:
  - `setTrendingFromServer`
  - `addTrendingProduct`
  - `removeTrendingProduct`
  - `reorderTrending`
  - `markSaved`

## 5) File structure gợi ý

- `src/types/trending.ts`
- `src/lib/api/trendingApi.ts`
- `src/lib/api/productApi.ts`
- `src/validation/productFilterSchema.ts`
- `src/hooks/useProducts.ts`
- `src/hooks/useTrending.ts`
- `src/hooks/useUpdateTrending.ts`
- `src/store/trendingAdmin/trendingAdminSlice.ts`
- `src/pages/admin/TrendingAdminPage.tsx`
- `src/components/admin/trending/ProductSourceList.tsx`
- `src/components/admin/trending/TrendingDropZone.tsx`

## 6) Acceptance criteria

- Trang admin load được:
  - product list có search/filter/sort/pagination
  - trending list hiện tại
- Có thể add/remove product vào trending mà không trùng.
- Kéo thả reorder hoạt động.
- Save gọi đúng `PUT /api/trending` với payload chuẩn `{ items: [{ productId, priority }] }`.
- Gửi đúng header token kiểu `token: Bearer <token>`.
- Hiển thị lỗi BE rõ ràng khi save fail.

## 7) Optional nâng cao

- Nút "Discard changes" để rollback state về lần load cuối.
- Cảnh báo confirm khi rời trang mà `isDirty = true`.
- Debounce search 300ms cho ô tìm kiếm.
- Disable nút Save nếu danh sách trending rỗng hoặc không có thay đổi.

