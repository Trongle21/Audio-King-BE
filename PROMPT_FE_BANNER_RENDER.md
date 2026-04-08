# Prompt FE: Render Banner từ API (Audio-King)

Bạn là Senior Frontend Engineer (React). Hãy implement phần client để **fetch và render banner** theo API backend hiện có.

## 1) API contract bắt buộc (dựa trên BannerController)

### Lấy danh sách banner (public)

- **Method**: `GET`
- **URL**: `/api/banners`
- **Auth**: không cần token

### Response success (200)

Format BE:

```ts
type ApiSuccess<T> = {
  message: string;
  data: T;
};
```

`GET /api/banners` trả:

```ts
type BannerImage = {
  url: string;
  alt: string;
};

type Banner = {
  _id: string;
  images: BannerImage[];
  createdAt: string;
  updatedAt: string;
};

type GetBannersResponse = ApiSuccess<Banner[]>;
```

Backend sort theo `updatedAt desc` (banner mới cập nhật lên trước).
Singleton yêu cầu mới: `GET /api/banners` trả **mảng tối đa 1 phần tử**:

- `data = []` nếu chưa có banner
- `data = [banner]` nếu có 1 banner duy nhất

## 2) Mục tiêu UI

Render section banner ở trang client (home):

- Nếu có dữ liệu:
  - Render slider/carousel ảnh banner.
  - Vì backend là singleton nên lấy trực tiếp `data[0].images` (không cần flatten).
- Nếu loading: hiển thị skeleton.
- Nếu lỗi: hiển thị fallback message ngắn + nút retry.
- Nếu data rỗng: ẩn section banner hoặc render placeholder mặc định.

## 3) Yêu cầu kỹ thuật

### API layer

Tạo hàm API riêng:

- `getBanners(): Promise<Banner[]>`
- Parse response từ `{ message, data }` và return `data`.

### Hook

Tạo hook `useBanners`:

```ts
type UseBannersResult = {
  banner: Banner | null; // singleton
  images: BannerImage[]; // = banner?.images ?? []
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
```

Logic:

- Gọi API khi mount.
- Chuẩn hóa lỗi (ưu tiên `response.data.message`, fallback `"Không thể tải banner"`).
- Parse response `{ data }` thành `banners`.
- Vì singleton, lấy `banner = data?.[0] ?? null`.
- Lấy `images = banner?.images ?? []`.
- Bỏ qua ảnh không có `url`.

### Component

Tạo component `HomeBanner`:

- Nhận dữ liệu từ `useBanners`.
- Render:
  - loading state
  - error state + nút retry
  - success state với carousel
- Ảnh phải có:
  - `src = image.url`
  - `alt = image.alt || "banner"`
  - lazy loading (`loading="lazy"`)
  - class responsive (cover, bo góc nếu cần)

## 4) Redux (nếu dự án đang dùng Redux cho shared UI data)

Nếu muốn cache banner global:

- Tạo `bannerSlice`:
  - state: `items`, `status`, `error`
  - thunk: `fetchBanners`
- Selector:
  - `selectBanners`
  - `selectBannerSlides`
  - `selectBannerStatus`

Nếu dự án đã có React Query/RTK Query thì ưu tiên dùng cache của thư viện đó, không bắt buộc Redux.

## 5) File structure gợi ý

- `src/types/banner.ts`
- `src/lib/api/bannerApi.ts`
- `src/hooks/useBanners.ts`
- `src/components/home/HomeBanner.tsx`
- `src/components/common/BannerSkeleton.tsx`

(Nếu dùng Redux)

- `src/store/banner/bannerSlice.ts`
- `src/store/banner/bannerSelectors.ts`

## 6) Acceptance criteria

- `GET /api/banners` được gọi đúng endpoint.
- UI render được banner ảnh từ `data[0].images[]` (singleton).
- Có đủ 4 state: loading / success / empty / error.
- Có retry khi lỗi.
- Không crash khi `images` rỗng hoặc thiếu `alt`.

## 7) Optional nâng cao

- Auto-play carousel 3-5s.
- Dot indicator + next/prev.
- Click banner để điều hướng (nếu sau này BE có thêm link).
- Dùng `memo` hoặc tối ưu re-render cho danh sách ảnh lớn.
