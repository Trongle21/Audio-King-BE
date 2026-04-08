# Prompt FE Vibe Code: Admin quan ly Banner + About (Singleton)

Bạn là Senior Frontend Engineer (React). Hãy implement frontend cho 2 module:
- Banner admin
- About admin

Theo logic backend moi nhat:
- Moi module chi co **1 document duy nhat** (singleton)
- Document chua mang `images[]`
- Co the add / replace / delete 1 hoac nhieu anh trong mang do

---

## 1) API contract quan trong

### 1.1 Banner (singleton)

#### Get banner (public)
- `GET /api/banners`
- Response: `{ message, data }`, trong do `data` la mang toi da 1 phan tu:
  - `[]` neu chua co
  - `[banner]` neu da co singleton

#### Create/replace full banner images (admin)
- `POST /api/banners`
- `multipart/form-data`
- field: `files` (array)
- Neu da ton tai banner, backend se replace toan bo `images`

#### Update by id (admin)
- `PATCH /api/banners/:id`
- `multipart/form-data`
- field: `files` (array)
- Replace toan bo `images` cua banner id do

#### Delete banner doc (admin)
- `DELETE /api/banners/:id`

#### Add images vao cuoi mang (admin)
- `POST /api/banners/images`
- `multipart/form-data`
- field: `files` (array)

#### Replace images theo index (admin)
- `PATCH /api/banners/images`
- `multipart/form-data`
- fields:
  - `files` (array)
  - `indices` (string JSON array), vi du: `"[0,2]"`
- So luong file phai bang so luong indices

#### Delete images (admin)
- `DELETE /api/banners/images`
- JSON body:
```ts
{
  indices?: number[];
  publicIds?: string[];
}
```
- Bat buoc it nhat 1 trong 2 key co du lieu

---

### 1.2 About (singleton)

#### Get about (public)
- `GET /api/about`
- Response: `{ message, data }`, `data` la mang toi da 1 phan tu:
  - `[]` hoac `[about]`

#### Create/replace full about images (admin)
- `POST /api/about`
- `multipart/form-data`
- field: `files` (array)

#### Update by id (admin)
- `PATCH /api/about/:id`
- `multipart/form-data`
- field: `files` (array)

#### Delete about doc (admin)
- `DELETE /api/about/:id`

#### Add images vao cuoi mang (admin)
- `POST /api/about/images`
- `multipart/form-data`
- field: `files` (array)

#### Replace images theo index (admin)
- `PATCH /api/about/images`
- `multipart/form-data`
- fields:
  - `files` (array)
  - `indices` (JSON string)

#### Delete images (admin)
- `DELETE /api/about/images`
- JSON body:
```ts
{
  indices?: number[];
  publicIds?: string[];
}
```

---

## 2) Auth convention bat buoc

Admin APIs yeu cau header token dung format backend:
```http
token: Bearer <accessToken>
```

Khong dung `Authorization` neu backend hien tai chua doc header nay.

---

## 3) Data types FE

```ts
type MediaImage = {
  url: string;
  alt: string;
  publicId?: string;
  resourceType?: string;
};

type SingletonDoc = {
  _id: string;
  images: MediaImage[];
  createdAt?: string;
  updatedAt?: string;
};
```

---

## 4) Yeu cau UI

Tao 2 trang admin:
- `BannerAdminPage`
- `AboutAdminPage`

Moi trang gom:
1. Preview danh sach image slots (`index`, thumbnail, alt)
2. Add nhieu anh vao cuoi list
3. Replace nhieu anh theo cac index duoc chon
4. Delete nhieu anh theo index (hoac publicId)
5. Nut refetch
6. Loading + success + error state ro rang

Neu singleton chua ton tai (`data = []`):
- hien thi empty state
- cho phep upload add/create de tao moi

---

## 5) API layer + hooks

### Banner API functions
- `getBannerSingleton(): Promise<SingletonDoc | null>`
- `createBanner(files: File[]): Promise<SingletonDoc>`
- `updateBannerById(id: string, files: File[]): Promise<SingletonDoc>`
- `addBannerImages(files: File[]): Promise<SingletonDoc>`
- `replaceBannerImages(indices: number[], files: File[]): Promise<SingletonDoc>`
- `deleteBannerImages(payload: { indices?: number[]; publicIds?: string[] }): Promise<SingletonDoc>`

### About API functions
- `getAboutSingleton(): Promise<SingletonDoc | null>`
- `createAbout(files: File[]): Promise<SingletonDoc>`
- `updateAboutById(id: string, files: File[]): Promise<SingletonDoc>`
- `addAboutImages(files: File[]): Promise<SingletonDoc>`
- `replaceAboutImages(indices: number[], files: File[]): Promise<SingletonDoc>`
- `deleteAboutImages(payload: { indices?: number[]; publicIds?: string[] }): Promise<SingletonDoc>`

### Hooks de xai
- `useBannerSingleton()`
- `useAboutSingleton()`

Moi hook tra ve:
```ts
{
  doc: SingletonDoc | null;
  images: MediaImage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

---

## 6) Zod + react-hook-form

Dung `react-hook-form` + `zodResolver` cho form replace/delete.

### Replace schema
```ts
import { z } from "zod";

export const replaceImagesSchema = z.object({
  indices: z.array(z.number().int().min(0)).min(1, "Phai chon it nhat 1 index"),
});
```

Validation bo sung trong submit:
- `files.length === indices.length`

### Delete schema
```ts
import { z } from "zod";

export const deleteImagesSchema = z
  .object({
    indices: z.array(z.number().int().min(0)).optional(),
    publicIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    v => (v.indices?.length ?? 0) + (v.publicIds?.length ?? 0) > 0,
    { message: "Can it nhat 1 indices hoac publicIds" }
  );
```

---

## 7) Payload details (quan trong)

### Add / Create / Update
- Dung `FormData`
- append nhieu file:
```ts
files.forEach(file => formData.append("files", file));
```

### Replace by indices
```ts
const formData = new FormData();
files.forEach(file => formData.append("files", file));
formData.append("indices", JSON.stringify(indices));
```

### Delete images
```ts
await api.delete("/api/banners/images", {
  data: { indices: [0, 2] }
});
```
hoac
```ts
await api.delete("/api/about/images", {
  data: { publicIds: ["uploads_about/abc"] }
});
```

---

## 8) Error handling

Luon uu tien message tu backend:
- `error.response?.data?.message`
- fallback: `"Co loi xay ra, vui long thu lai"`

Khong reset UI neu request fail.
Sau request success:
- update state theo response data hoac refetch.

---

## 9) File structure goi y

- `src/types/media.ts`
- `src/lib/api/bannerApi.ts`
- `src/lib/api/aboutApi.ts`
- `src/hooks/useBannerSingleton.ts`
- `src/hooks/useAboutSingleton.ts`
- `src/validation/replaceImagesSchema.ts`
- `src/validation/deleteImagesSchema.ts`
- `src/pages/admin/BannerAdminPage.tsx`
- `src/pages/admin/AboutAdminPage.tsx`
- `src/components/admin/media/ImageSlotList.tsx`
- `src/components/admin/media/UploadActions.tsx`

---

## 10) Acceptance criteria

1. Banner admin:
   - load duoc singleton
   - add/replace/delete nhieu anh hoat dong dung API
2. About admin:
   - logic giong banner, hoat dong day du
3. Support state:
   - loading / empty / success / error
4. Replace:
   - check files count = indices count truoc khi submit
5. Delete:
   - xoa duoc bang indices hoac publicIds
6. Header token gui dung key `token`

