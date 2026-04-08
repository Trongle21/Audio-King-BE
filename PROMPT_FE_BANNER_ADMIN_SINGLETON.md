# Prompt FE Admin: Banner Singleton (add/replace/delete images)

Bạn là Senior Frontend Engineer (React). Hãy implement màn Admin để quản lý banner theo logic backend mới nhất:

- `GET /api/banners` trả singleton: `data` la max 1 banner
- Admin co the thay doi `banner.images[]` theo 3 endpoint moi

## 1) Auth + header convention (quan trong)

- Admin endpoints yeu cau token
- Backend middleware `verifyToken` lay tu header: `req.headers.token`
- FE gui token theo dang: `token: Bearer <accessToken>`

## 2) API contract bat buoc

### A. Lay banner hien tai (singleton)

- Method: `GET`
- URL: `/api/banners`
- Auth: khong can token

Response (success 200):

- `{ message: string, data: Banner[] }`
- Backend dam bao `data` chi max 1 phan tu: `data = []` hoac `data = [banner]`

`Banner`:

```ts
type BannerImage = {
  url: string;
  alt: string;
  publicId?: string;
  resourceType?: string;
};

type Banner = {
  _id: string;
  images: BannerImage[];
};
```

### B. Add anh vao cuoi `banner.images`

- Method: `POST`
- URL: `/api/banners/images`
- Auth: admin required
- Body: `multipart/form-data`
  - field file array: `files` (multer array)

Response:

- `{ message, data: Banner }`

### C. Replace nhieu anh theo index

- Method: `PATCH`
- URL: `/api/banners/images`
- Auth: admin required
- Body: `multipart/form-data`
  - field file array: `files` (so luong file = so luong index)
  - field `indices`: string JSON array, vi du: `"[0,2,3]"`

Response:

- `{ message, data: Banner }`

Rang buoc quan trong:

- `indices` hop le 0..(images.length - 1)
- So luong `files` phai bang so luong `indices`

### D. Delete anh trong `banner.images`

- Method: `DELETE`
- URL: `/api/banners/images`
- Auth: admin required
- Body: JSON
  - `indices?: number[]`
  - `publicIds?: string[]`
  - bat buoc it nhat 1 trong 2 mach tren co length > 0

Response:

- `{ message, data: Banner }`

## 3) Muc tieu UI (Admin page)

Implement page `BannerAdminPage`:

- Header
- Khu hien thi danh sach anh banner dang co
- Khu action:
  1. Add: upload nhieu file, add vao cuoi
  2. Replace: user chon 1..N slot (index), upload N file, sau do thay the
  3. Delete: chon 1..N slot (index) hoac chon theo publicId, sau do xoa
- Co state: loading / success toast / error toast
- Sau moi action thanh cong: refetch `GET /api/banners` de cap nhat UI

## 4) React state / selectors

State trong page:

- `banner: Banner | null`
- `images: BannerImage[]`
- `selectedIndices: number[]` (cho replace va delete)
- `replaceFiles: File[]` (input file)
- `addFiles: File[]` (input file)
- `isSubmitting: boolean`

## 5) Zod + react-hook-form (yeu cau)

Hay dung `react-hook-form` + `zodResolver`.

### A. Schema cho Replace

`replaceIndicesSchema`:

```ts
import { z } from 'zod';
export const replaceIndicesSchema = z.object({
  indices: z.array(z.number().int().min(0)).min(1),
});
```

Kiem tra them (logic trong submit handler):

- `replaceFiles.length === indices.length`

### B. Schema cho Delete

`deleteSchema`:

```ts
import { z } from 'zod';
export const deleteSchema = z
  .object({
    indices: z.array(z.number().int().min(0)).optional(),
    publicIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    data => (data.indices?.length ?? 0) + (data.publicIds?.length ?? 0) > 0,
    { message: 'Phai chon it nhat 1 slot hoac 1 publicId' }
  );
```

## 6) API integration details (FE gui dung payload)

### A. Add

- Create `FormData`
  - `formData.append('files', file)` for each file
- Call: `POST /api/banners/images`

### B. Replace

- Create `FormData`
  - append `files` for each selected replace file
  - append `indices` as JSON string: `formData.append('indices', JSON.stringify(indices))`
- Call: `PATCH /api/banners/images`

### C. Delete

- Call: `DELETE /api/banners/images`
- `Content-Type: application/json`
- Body:
  - either `{ indices: selectedIndices }`
  - or `{ publicIds: images.filter(i => selectedIndices.includes(index)).map(i => i.publicId) }`

## 7) Error handling (bám BE)

Khi request fail:

- ưu tien show `response.data.message` neu co
- fallback: `Co loi khi cap nhat banner`
- khong refetch neu fail

Khi images slot bi sai:

- BE tra error 400 (vi du: indices vuot qua do dai) => show message

## 8) Rendering requirement

Render mỗi image slot:

- index label (vi du: `#0`, `#1`, ...)
- thumbnail
- checkbox/select để user chon indices cho replace/delete

Sau replace/delete:

- cap nhat UI theo response data (hoac refetch).

## 9) File structure gợi y

- `src/types/banner.ts`
- `src/lib/api/bannerAdminApi.ts`
- `src/components/admin/banner/BannerAdminPage.tsx`
- `src/components/admin/banner/BannerImageSlot.tsx`
- `src/validation/bannerReplaceSchema.ts`
- `src/validation/bannerDeleteSchema.ts`
- (optional) `src/hooks/useBannerSingleton.ts`

## 10) Acceptance criteria

1. `BannerAdminPage` load dung UI tu `GET /api/banners` (data max 1)
2. Add upload nhieu file, sau thanh cong UI refresh va images tang len
3. Replace:
   - user chon N indices
   - upload N file
   - call PATCH dung `FormData` với:
     - `files` length = N
     - `indices` JSON string
4. Delete:
   - user chon indices
   - call DELETE với JSON `{ indices: [...] }`
5. Khong crash khi `banner` la null (chua co banner):
   - add co the tao banner moi
6. Co loading state va error toast message ro rang
