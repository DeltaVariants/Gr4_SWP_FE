# Admin Authentication Setup

## Tổng quan

Các trang admin đã được bảo vệ bằng authentication. Mỗi request API sẽ tự động kèm theo Bearer token trong header.

## Các thành phần đã cập nhật

### 1. API Client (`src/lib/api.ts`)

- Tự động thêm Bearer token vào mọi request
- Ưu tiên: `localStorage.accessToken` → `NEXT_PUBLIC_API_TOKEN` (từ .env)
- Tự động refresh token khi hết hạn (401)
- Redirect về `/login` nếu refresh thất bại

### 2. Middleware (`src/middleware.ts`)

- Bảo vệ các routes admin:
  - `/dashboard`
  - `/battery-management`
  - `/station-management`
  - `/user-management`
  - `/transactions-reports`
  - `/system-config`
- Kiểm tra:
  - User phải đăng nhập (có token trong cookie)
  - User phải có role `ADMIN`
- Redirect về `/login` nếu chưa đăng nhập
- Redirect về `/home` nếu không phải admin

### 3. Admin Layout (`src/app/(admin)/layout.tsx`)

- Bọc tất cả trang admin bằng `AdminAuthGuard`
- Guard sẽ kiểm tra authentication trước khi render

### 4. AdminAuthGuard (`src/app/(admin)/components/AdminAuthGuard.tsx`)

- Component guard để bảo vệ admin routes
- Kiểm tra:
  - User đã authenticated
  - User có role ADMIN
- Hiển thị loading khi đang check
- Redirect về login/home nếu không pass checks

### 5. Token Utils (`src/lib/token.ts`)

- Utility functions để làm việc với token:
  - `getAccessToken()`: Lấy token (ưu tiên localStorage)
  - `getAuthHeader()`: Tạo Authorization header
  - `hasValidToken()`: Check có token hợp lệ không

## Cách sử dụng

### Development/Testing với token từ .env (DEV MODE)

Trong file `.env`:

```env
NEXT_PUBLIC_API_TOKEN=your_admin_token_here
```

**🔓 DEV MODE - Bypass Authentication:**

Khi có `NEXT_PUBLIC_API_TOKEN` trong file `.env`:

- ✅ **Middleware sẽ BYPASS** - Không cần cookie, không check role
- ✅ **AdminAuthGuard sẽ BYPASS** - Không cần đăng nhập
- ✅ **API calls tự động dùng token này** trong header
- ✅ **Truy cập trực tiếp** vào bất kỳ admin page nào mà không cần login

**⚠️ Chú ý:**

- DEV MODE chỉ nên dùng khi development/testing
- Production không nên set `NEXT_PUBLIC_API_TOKEN` trong .env
- Token này sẽ được exposed ra client-side (vì có prefix `NEXT_PUBLIC_`)

Token này sẽ được sử dụng khi:

- Không có token trong localStorage
- Dùng để test API mà không cần login
- Muốn bypass authentication để test nhanh

### Production - Sử dụng token thực

1. User đăng nhập qua `/login`
2. Token được lưu vào `localStorage.accessToken`
3. Mọi API call sẽ tự động dùng token này
4. Middleware check role trước khi cho truy cập admin pages

### Gọi API với token

API client tự động thêm token, bạn chỉ cần:

```typescript
import api from "@/lib/api";

// Token tự động được thêm vào header
const response = await api.get("/admin/users");
const data = await api.post("/admin/stations", stationData);
```

### Sử dụng token utils

```typescript
import { getAccessToken, getAuthHeader, hasValidToken } from "@/lib/token";

// Lấy token
const token = getAccessToken();

// Lấy header object
const headers = {
  ...getAuthHeader(),
  "Content-Type": "application/json",
};

// Check có token không
if (hasValidToken()) {
  // Make authenticated request
}
```

## Flow Authentication

```
1. User truy cập /dashboard
   ↓
2. Middleware check cookie (token + role)
   ↓
3a. Không có → Redirect /login
3b. Có nhưng không phải ADMIN → Redirect /home
3c. Có và là ADMIN → Allow
   ↓
4. AdminAuthGuard check AuthContext
   ↓
5a. Not authenticated → Redirect /login
5b. Authenticated but not ADMIN → Redirect /home
5c. Authenticated and ADMIN → Render page
   ↓
6. Page gọi API
   ↓
7. api.ts tự động thêm Bearer token
   ↓
8. Backend xác thực token
   ↓
9a. Token hợp lệ → Return data
9b. Token expired (401) → Auto refresh
9c. Refresh failed → Redirect /login
```

## Bảo mật

- Token được lưu trong localStorage (client-side)
- Cookie được dùng cho middleware (server-side protection)
- Mỗi request đều kèm Bearer token
- Auto-refresh khi token hết hạn
- Tự động logout khi refresh thất bại
- Double-layer protection: Middleware + AuthGuard

## Testing

### Test với token từ .env (DEV MODE - BYPASS AUTH):

1. Set `NEXT_PUBLIC_API_TOKEN` trong `.env`
2. **Truy cập TRỰC TIẾP** `/dashboard` (không cần login)
3. Middleware và AuthGuard sẽ tự động bypass
4. API calls sẽ dùng token từ .env
5. Console sẽ hiển thị: `🔓 [DEV MODE] Bypassing...`

### Test với login thật (PRODUCTION MODE):

1. **XÓA hoặc comment** `NEXT_PUBLIC_API_TOKEN` trong `.env`
2. Login qua `/login` với admin credentials
3. Token được lưu vào localStorage
4. Truy cập `/dashboard`
5. API calls sẽ dùng token từ localStorage

## Troubleshooting

### Không truy cập được admin pages:

- Check console để xem role trong cookie
- Verify token trong localStorage hoặc .env
- Check middleware logs

### API calls bị 401:

- Check token có hợp lệ không
- Check token có được thêm vào header không (Network tab)
- Verify token format: `Bearer <token>`

### Infinite redirect loop:

- Check middleware config
- Verify role được set đúng khi login
- Check AuthContext state
