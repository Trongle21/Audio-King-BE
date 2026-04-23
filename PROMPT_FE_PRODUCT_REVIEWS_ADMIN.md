# PROMPT_FE_PRODUCT_REVIEWS_ADMIN.md

## Tổng quan

Backend đã được cập nhật để hỗ trợ admin quản lý reviews (đánh giá) cho sản phẩm. Mỗi sản phẩm có thể có nhiều reviews do admin tự thêm (fake reviews). Mỗi review có:
- `rating`: Số sao (1-5), mặc định là 5
- `review`: Nội dung đánh giá (tối đa 500 ký tự)

---

## Các API Endpoints mới

### 1. Lấy danh sách reviews của sản phẩm
```
GET /api/products/:id/reviews
```
**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách đánh giá thành công",
  "data": {
    "productId": "...",
    "productName": "Tên sản phẩm",
    "reviews": [
      {
        "_id": "review_id",
        "rating": 5,
        "review": "Sản phẩm rất tốt!",
        "createdAt": "2026-04-23T...",
        "updatedAt": "2026-04-23T..."
      }
    ],
    "totalReviews": 1
  }
}
```

### 2. Thêm nhiều reviews cùng lúc
```
POST /api/products/:id/reviews
Headers: {
  "token": "admin_token",
  "Content-Type": "application/json"
}
Body:
{
  "reviews": [
    {
      "rating": 5,
      "review": "Âm thanh cực kỳ sống động!"
    },
    {
      "rating": 4,
      "review": "Sản phẩm tốt, giao hàng nhanh"
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Thêm 2 đánh giá thành công",
  "data": [...]
}
```

### 3. Cập nhật toàn bộ reviews (thay thế)
```
PUT /api/products/:id/reviews
Headers: {
  "token": "admin_token",
  "Content-Type": "application/json"
}
Body:
{
  "reviews": [
    {
      "rating": 5,
      "review": "Đánh giá mới 1"
    },
    {
      "rating": 5,
      "review": "Đánh giá mới 2"
    },
    {
      "rating": 4,
      "review": "Đánh giá mới 3"
    }
  ]
}
```

### 4. Xóa một review cụ thể
```
DELETE /api/products/:id/reviews/:reviewId
Headers: {
  "token": "admin_token"
}
```

---

## Yêu cầu UI/UX cho Admin Panel

### 1. Trang quản lý Reviews của sản phẩm

**Vị trí:** Thêm tab/tab mới trong trang chi tiết sản phẩm hoặc trang riêng "Quản lý Reviews"

**Tính năng cần có:**

#### a) Hiển thị danh sách Reviews
- Hiển thị tất cả reviews của sản phẩm
- Mỗi review hiển thị:
  - Số sao (icon star)
  - Nội dung review
  - Thời gian tạo
  - Nút xóa (icon trash)
- Tổng số reviews

#### b) Form thêm Reviews (Bulk)
- Textarea hoặc input để nhập nhiều reviews cùng lúc
- Mỗi review cách nhau bằng dòng mới
- Hoặc: Danh sách input động (thêm/bớt dòng)
- Rating mặc định: 5 sao (có thể chọn 1-5 sao)
- Nút "Thêm Reviews"

#### c) Quick Add Reviews
- Một số template có sẵn để admin chọn nhanh:
  - "Sản phẩm rất tốt, âm thanh sống động"
  - "Giao hàng nhanh, đóng gói cẩn thận"
  - "Sản phẩm đúng như mô tả"
  - "Chất lượng vượt xa kỳ vọng"
  - "Giá cả hợp lý, đáng mua"

#### d) Validation
- Review không được quá 500 ký tự
- Rating từ 1-5 sao

### 2. Giao diện mẫu (Mockup)

```
┌─────────────────────────────────────────────────────────────┐
│  Quản lý Reviews - Tai Nghe Bluetooth XYZ                   │
├─────────────────────────────────────────────────────────────┤
│  Tổng số: 5 reviews                                        │
├─────────────────────────────────────────────────────────────┤
│  ⭐⭐⭐⭐⭐ | Sản phẩm rất tốt, âm thanh sống động!  | 🗑️    │
│  ⭐⭐⭐⭐⭐ | Giao hàng nhanh, đóng gói cẩn thận    | 🗑️    │
│  ⭐⭐⭐⭐  | Sản phẩm tốt, nhưng hơi nhỏ         | 🗑️    │
│  ⭐⭐⭐⭐⭐ | Chất lượng vượt xa kỳ vọng          | 🗑️    │
│  ⭐⭐⭐⭐⭐ | Giá cả hợp lý, đáng mua              | 🗑️    │
├─────────────────────────────────────────────────────────────┤
│  Thêm Reviews mới:                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Rating: ⭐⭐⭐⭐⭐ (dropdown 1-5)                     │    │
│  │ Review: [                                      ]    │
│  │                                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│  [Template nhanh ▼]  [Thêm Review]                          │
├─────────────────────────────────────────────────────────────┤
│  Thêm nhiều reviews:                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. ⭐⭐⭐⭐⭐ | Sản phẩm chất lượng              | [x] │    │
│  │ 2. ⭐⭐⭐⭐  | Giao hàng nhanh                    | [x] │    │
│  │ 3. ⭐⭐⭐⭐⭐ | Đáng tiền                         | [x] │    │
│  └─────────────────────────────────────────────────────┘    │
│  [+ Thêm dòng]  [Thêm tất cả]                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Feedback UX
- Toast notification khi thêm/xóa thành công
- Confirm dialog trước khi xóa review
- Loading state khi đang gọi API
- Error handling với message từ backend

---

## Mẫu Code Template

### Service Layer
```javascript
// services/productReviewService.js
const API_URL = process.env.API_URL;

export const productReviewService = {
  getReviews: async (productId) => {
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews`);
    return response.json();
  },

  addReviews: async (productId, reviews) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({ reviews }),
    });
    return response.json();
  },

  updateReviews: async (productId, reviews) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({ reviews }),
    });
    return response.json();
  },

  deleteReview: async (productId, reviewId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/api/products/${productId}/reviews/${reviewId}`,
      {
        method: 'DELETE',
        headers: { 'token': token },
      }
    );
    return response.json();
  },
};
```

### Component State (React)
```javascript
// States cần thiết
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState({ rating: 5, review: '' });
const [bulkReviews, setBulkReviews] = useState([{ rating: 5, review: '' }]);
const [loading, setLoading] = useState(false);

// Functions
const handleAddSingleReview = async () => { ... };
const handleAddBulkReviews = async () => { ... };
const handleDeleteReview = async (reviewId) => { ... };
const handleQuickAdd = (template) => { ... };
```

---

## Lưu ý quan trọng

1. **Reviews nằm trong product**: Reviews được lưu trong document của Product, không phải collection riêng
2. **Admin only**: Tất cả các endpoint thêm/sửa/xóa đều yêu cầu token admin
3. **Default rating**: Luôn mặc định là 5 sao để admin thêm nhanh
4. **Timestamps**: Mỗi review có createdAt/updatedAt tự động

---

## Validation Backend

- `rating`: 1-5 (number)
- `review`: tối đa 500 ký tự, optional (có thể để trống)
- `reviews` array: có thể thêm nhiều review cùng lúc
