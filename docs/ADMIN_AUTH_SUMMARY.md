# Admin Authentication - Summary of Changes

## ✅ Đã hoàn thành

### 1. **API Client với Bearer Token** (`src/lib/api.ts`)

- ✅ Tự động thêm `Bearer ${token}` vào header mọi request
- ✅ Ưu tiên localStorage, fallback to `NEXT_PUBLIC_API_TOKEN` từ .env
- ✅ Auto-refresh token khi 401

### 2. **Middleware Protection** (`src/middleware.ts`)

- ✅ Bảo vệ tất cả admin routes: `/dashboard`, `/station-management`, `/battery-management`, etc.
- ✅ Check authentication (cookie token)
- ✅ Check role = ADMIN
- ✅ Redirect về `/login` nếu chưa đăng nhập
- ✅ Redirect về `/home` nếu không phải admin

### 3. **Admin Layout Guard** (`src/app/(admin)/layout.tsx`)

- ✅ Bọc tất cả trang admin với `AdminAuthGuard`
- ✅ Double-layer protection (Middleware + Client-side guard)

### 4. **AdminAuthGuard Component** (`src/app/(admin)/components/AdminAuthGuard.tsx`)

- ✅ Client-side authentication check
- ✅ Verify user role = ADMIN
- ✅ Show loading khi đang check
- ✅ Auto redirect nếu không hợp lệ

### 5. **Token Utilities** (`src/lib/token.ts`)

- ✅ `getAccessToken()` - Lấy token
- ✅ `getAuthHeader()` - Tạo Authorization header
- ✅ `hasValidToken()` - Check token hợp lệ

### 6. **Documentation** (`docs/ADMIN_AUTH.md`)

- ✅ Hướng dẫn chi tiết về cách sử dụng
- ✅ Flow authentication
- ✅ Troubleshooting guide

## 🚀 Cách sử dụng

### 🔓 DEV MODE - Bypass Authentication (dùng token từ .env):

**Để test KHÔNG CẦN ĐĂNG NHẬP:**

```env
# .env
NEXT_PUBLIC_API_TOKEN=your_admin_token_here
```

Khi có token này:

- ✅ Truy cập TRỰC TIẾP `/dashboard` mà không cần login
- ✅ Middleware tự động BYPASS (không check cookie/role)
- ✅ AdminAuthGuard tự động BYPASS
- ✅ API calls tự động dùng token này

**Để test với LOGIN THẬT:**

- ❌ Xóa hoặc comment `NEXT_PUBLIC_API_TOKEN`
- ✅ Login qua `/login` như bình thường

### Gọi API (tự động thêm token):

```typescript
import api from "@/lib/api";

// Token tự động được thêm vào header
const data = await api.get("/admin/users");
```

## 🔒 Bảo mật

- ✅ Double-layer protection (Middleware + AuthGuard)
- ✅ Bearer token trên mọi API request
- ✅ Auto-refresh token
- ✅ Role-based access control
- ✅ Secure redirect flow

## 📋 Protected Routes

Tất cả routes sau đã được bảo vệ (chỉ ADMIN truy cập được):

- `/dashboard`
- `/battery-management`
- `/station-management`
- `/user-management`
- `/transactions-reports`
- `/system-config`

## ✨ Features

1. **Tự động thêm Bearer token**: Mọi API call đều có token trong header
2. **Fallback to .env**: Dùng `NEXT_PUBLIC_API_TOKEN` khi development
3. **Auto-refresh**: Tự động refresh token khi hết hạn
4. **Smart redirect**: Redirect đúng trang dựa vào trạng thái auth
5. **Loading state**: Hiển thị loading khi check authentication
6. **Error handling**: Xử lý lỗi auth một cách graceful

## 🧪 Testing

1. **Test DEV MODE (Bypass Auth với .env token)**:

   - ✅ Set `NEXT_PUBLIC_API_TOKEN` trong `.env`
   - ✅ Truy cập TRỰC TIẾP `/dashboard` (không cần login)
   - ✅ Console hiển thị: `🔓 [DEV MODE] Bypassing...`
   - ✅ Check Network tab xem Bearer token trong header

2. **Test PRODUCTION MODE (Login thật)**:

   - ❌ XÓA `NEXT_PUBLIC_API_TOKEN` từ `.env`
   - ✅ Truy cập `/dashboard` → Redirect về `/login`
   - ✅ Login với admin account
   - ✅ Token lưu vào localStorage
   - ✅ Truy cập admin pages thành công
   - ✅ Verify API calls có token từ localStorage

3. **Test unauthorized**:
   - ❌ Xóa token/cookie và .env token
   - ❌ Truy cập `/dashboard`
   - ✅ Verify redirect về `/login`

## 📝 Notes

- Token trong localStorage có priority cao hơn .env
- Middleware check cookie, AuthGuard check localStorage
- Double protection đảm bảo security tối đa
- Auto logout khi token invalid/expired
