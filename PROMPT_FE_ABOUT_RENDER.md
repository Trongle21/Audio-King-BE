# Prompt FE: Render About Images từ API (Audio-King)

Bạn là Senior Frontend Engineer (React). Hãy implement phần client để fetch và render ảnh trang About theo backend hiện có.

## 1) API contract (dựa trên AboutController)

### Lấy danh sách ảnh about (public)
- **Method**: `GET`
- **URL**: `/api/about`
- **Auth**: không cần token
- **Query params**:
  - `page` (default `1`)
  - `limit` (default `12`)

Ví dụ: `/api/about?page=1&limit=12`

### Response success (200)
Backend trả format:

```ts
type AboutImage = {
  url: string;
  alt: string;
};

type AboutListResponse = {
  message: string;
  data: {
    items: AboutImage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};
```

### Hành vi BE cần lưu ý
- BE lấy nhiều document About, merge toàn bộ `images` thành một list chung.
- Sau đó mới phân trang bằng `slice(skip, skip + limit)`.
- Vì vậy client chỉ cần dùng `data.items` để render và `data.pagination` để điều hướng trang.

## 2) Mục tiêu UI

Implement section/trang About:
- Render gallery ảnh từ `data.items`.
- Có 4 state:
  - loading
  - success
  - empty (không có ảnh)
  - error (có nút retry)
- Có pagination UI:
  - Prev/Next
  - Hiển thị trang hiện tại / tổng trang
  - Disable nút khi ở đầu/cuối

## 3) Yêu cầu kỹ thuật

### Types
Tạo type rõ ràng:

```ts
type AboutImage = { url: string; alt: string };
type AboutPagination = { total: number; page: number; limit: number; totalPages: number };
type AboutData = { items: AboutImage[]; pagination: AboutPagination };
```

### API layer
Tạo hàm:

```ts
async function getAboutImages(params: { page?: number; limit?: number }): Promise<AboutData>
```

- Gọi `GET /api/about`
- Parse response `{ message, data }`
- Return `data`
- Chuẩn hóa lỗi (ưu tiên message từ BE)

### Hook
Tạo hook:

```ts
function useAboutImages(initialPage?: number, initialLimit?: number): {
  items: AboutImage[];
  pagination: AboutPagination;
  page: number;
  setPage: (p: number) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

Logic:
- Fetch lại khi `page` hoặc `limit` đổi.
- Validate dữ liệu ảnh:
  - Bỏ ảnh thiếu `url`
  - `alt` fallback thành `"about-image"`

### Component
Tạo `AboutGallery`:
- Dùng hook `useAboutImages`.
- Render danh sách ảnh responsive grid.
- Ảnh:
  - `src={url}`
  - `alt={alt || "about-image"}`
  - `loading="lazy"`
- Có pagination controls.

## 4) Redux (optional)

Nếu muốn cache dữ liệu across pages:
- Tạo `aboutSlice`:
  - state: `itemsByPage`, `paginationByPage`, `status`, `error`
  - thunk: `fetchAboutImages({ page, limit })`
- Selector:
  - `selectAboutItemsByPage(page)`
  - `selectAboutPaginationByPage(page)`

Nếu đang dùng React Query/RTK Query thì ưu tiên cache của thư viện đó.

## 5) File structure gợi ý

- `src/types/about.ts`
- `src/lib/api/aboutApi.ts`
- `src/hooks/useAboutImages.ts`
- `src/components/about/AboutGallery.tsx`
- `src/components/common/AboutSkeleton.tsx`

(Nếu dùng Redux)
- `src/store/about/aboutSlice.ts`
- `src/store/about/aboutSelectors.ts`

## 6) Acceptance criteria

- Gọi đúng endpoint `GET /api/about?page=<page>&limit=<limit>`.
- Render đúng `data.items`.
- Có đủ loading/success/empty/error states.
- Có pagination hoạt động đúng theo `data.pagination`.
- Không crash khi item thiếu `alt` hoặc có item lỗi dữ liệu.

## 7) Optional nâng cao

- Lightbox khi click ảnh.
- Infinite scroll (nếu muốn thay pagination nút).
- Prefetch trang kế tiếp để chuyển trang mượt hơn.

