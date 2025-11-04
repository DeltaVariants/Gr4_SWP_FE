# 🔓 Quick Guide: Bypass Admin Authentication

## Để test admin pages KHÔNG CẦN ĐĂNG NHẬP:

### Bước 1: Set token trong `.env`

```env
NEXT_PUBLIC_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 2: Truy cập trực tiếp

Mở browser và truy cập bất kỳ admin page nào:

- http://localhost:3000/dashboard
- http://localhost:3000/station-management
- http://localhost:3000/battery-management
- etc.

### Bước 3: Kiểm tra

- ✅ Không bị redirect về `/login`
- ✅ Console hiển thị: `🔓 [DEV MODE] Bypassing admin auth check`
- ✅ API calls tự động có Bearer token trong header
- ✅ Dữ liệu load thành công

---

## Để test với LOGIN THẬT:

### Bước 1: Tắt DEV MODE

Xóa hoặc comment dòng này trong `.env`:

```env
# NEXT_PUBLIC_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 2: Restart dev server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Bước 3: Login như bình thường

- Truy cập `/login`
- Đăng nhập với admin credentials
- Token lưu vào localStorage
- Redirect về admin pages

---

## Troubleshooting

### ❌ Vẫn bị redirect về `/login` dù có token trong .env?

**Nguyên nhân:** Token có trong .env nhưng server chưa restart

**Giải pháp:**

1. Stop dev server (Ctrl+C)
2. Verify token có trong `.env`
3. Start lại: `npm run dev`
4. Clear browser cache nếu cần

### ❌ API calls bị 401 Unauthorized?

**Nguyên nhân:** Token hết hạn hoặc không hợp lệ

**Giải pháp:**

1. Kiểm tra token còn hợp lệ không (decode JWT)
2. Lấy token mới từ backend
3. Update `NEXT_PUBLIC_API_TOKEN` trong `.env`
4. Restart dev server

### ❌ Console không hiển thị "🔓 [DEV MODE]"?

**Nguyên nhân:** Token không có trong .env hoặc có typo

**Giải pháp:**

1. Check chính tả: `NEXT_PUBLIC_API_TOKEN` (không phải `NEXT_PUBLIC_TOKEN`)
2. Verify token có prefix `NEXT_PUBLIC_`
3. Không có khoảng trắng thừa
4. Restart dev server

---

## Token hiện tại trong .env:

```
NEXT_PUBLIC_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjM0NSIsImVtYWlsIjoiZXN3YXBAZW1haWwuY29tIiwidW5pcXVlX25hbWUiOiJBZG1pbiIsInJvbGUiOiJBZG1pbiIsIlN0YXRpb25JRCI6Im51bGwiLCJuYmYiOjE3NjIxODA4NTcsImV4cCI6MTc2MjE4NDQ1NywiaWF0IjoxNzYyMTgwODU3LCJpc3MiOiJodHRwczovL2dyNC1zd3AtYmUyLXNwMjUub25yZW5kZXIuY29tIiwiYXVkIjoiaHR0cHM6Ly9ncjQtc3dwLWJlMi1zcDI1Lm9ucmVuZGVyLmNvbSJ9.Uq7zadovse0jdNKqUwQl2ykULfqDrBUaMWS8DtM0aic
```

**⚠️ Lưu ý:** Token này expires vào `1762184457` (Unix timestamp)

- Nếu token hết hạn, bạn cần lấy token mới từ backend
- Decode token tại: https://jwt.io để xem thông tin và expiry time

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Check if env variables are loaded
# (In your page, add: console.log(process.env.NEXT_PUBLIC_API_TOKEN))

# Get new token (example - adjust based on your backend)
curl -X POST https://gr4-swp-be2-sp25.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

---

## Priority của Token

API client sử dụng token theo thứ tự ưu tiên:

1. **localStorage.accessToken** (priority cao nhất)
2. **process.env.NEXT_PUBLIC_API_TOKEN** (fallback)

Nếu bạn đã login và có token trong localStorage, nó sẽ được dùng thay vì .env token.

Để force dùng .env token:

```javascript
// Trong browser console
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
// Reload page
```
