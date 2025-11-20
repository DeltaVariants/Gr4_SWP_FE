# ✅ Login Flow Testing Checklist

## 🔧 **Các thay đổi đã thực hiện:**

### 1. **Sửa endpoint `/api/Auth/me`**

- ❌ Trước: `/api/auth/me` (lowercase)
- ✅ Sau: `${API_URL}/Auth/me` (PascalCase)

### 2. **Sửa refresh token payload**

- ❌ Trước: `{ RefreshToken }` (PascalCase)
- ✅ Sau: `{ refreshToken }` (camelCase)

### 3. **Sửa refresh endpoint**

- ❌ Trước: `${API_URL}/api/Auth/refresh`
- ✅ Sau: `${API_URL}/Auth/refresh`

### 4. **Thêm logging chi tiết**

- ✅ AuthContext: Log từng bước login
- ✅ Middleware: Log token/role check
- ✅ SessionCookieService: Return success/failure

---

## 🧪 **Test Login Flow**

### **Server đang chạy:**

```
http://localhost:3002
```

### **Bước 1: Test Login**

1. Mở browser: `http://localhost:3002/login`
2. Mở DevTools (F12) → Console tab
3. Nhập email/password và click Login
4. **Check Console logs:**
   ```
   [Auth] Starting login process...
   [Auth] Login successful: { user: "Admin", role: "Admin", redirectPath: "/dashboard" }
   [Auth] Tokens saved to localStorage
   [Auth] Setting session cookies...
   [Auth] Session cookies set successfully
   [Auth] Redirecting to: /dashboard
   ```

### **Bước 2: Check Network**

Mở DevTools → Network tab:

1. **Request 1: Login**

   ```
   POST https://gr4-swp-be2-sp25.onrender.com/api/Auth/login

   Request Payload:
   {
     "Email": "eswap@email.com",
     "Password": "..."
   }

   Response (200 OK):
   {
     "token": "...",
     "refreshToken": "...",
     "expiresAt": "2025-11-07T...",
     "authDTO": { ... }
   }
   ```

2. **Request 2: Set Session**

   ```
   POST http://localhost:3002/api/auth/session

   Request Payload:
   {
     "token": "...",
     "role": "Admin",
     "maxAge": 3600
   }

   Response (200 OK):
   {
     "success": true
   }
   ```

### **Bước 3: Check Cookies**

DevTools → Application → Cookies → `http://localhost:3002`

**Phải có 2 cookies:**

```
token:  <JWT token>         (httpOnly: true)
role:   ADMIN               (httpOnly: false)
```

### **Bước 4: Check localStorage**

DevTools → Application → Local Storage → `http://localhost:3002`

**Phải có 3 items:**

```
accessToken:   <JWT token>
refreshToken:  <refresh token>
expiresAt:     2025-11-07T04:52:22.6692286Z
```

### **Bước 5: Check Redirect**

- User với role **Admin** → Redirect to `/dashboard`
- User với role **Customer** → Redirect to `/home`
- User với role **Employee/Staff** → Redirect to `/dashboardstaff`

### **Bước 6: Check Middleware**

Check terminal logs (server console):

```
[Middleware] {
  pathname: '/dashboard',
  hasToken: true,
  role: 'ADMIN',
  hasAuth: true
}
```

---

## ❌ **Nếu vẫn bị redirect về login:**

### **Kiểm tra các điểm sau:**

#### 1. **Cookie không được set**

**Triệu chứng:** DevTools → Application → Cookies → Không có `token` và `role`

**Nguyên nhân:**

- API `/api/auth/session` failed
- Network error

**Cách fix:**

- Check Network tab → `/api/auth/session` response
- Check Console logs → "Failed to set session cookies"

#### 2. **Middleware không nhận được cookie**

**Triệu chứng:** Server logs hiển thị `hasToken: false`

**Nguyên nhân:**

- Cookie path sai
- Cookie httpOnly settings
- SameSite settings

**Cách fix:**

- Check `src/app/api/auth/session/route.ts`
- Đảm bảo: `path: '/', sameSite: 'lax'`

#### 3. **Token format sai**

**Triệu chứng:** Middleware logs `hasToken: true` nhưng vẫn redirect

**Nguyên nhân:**

- Role không khớp
- Token expired

**Cách fix:**

- Check localStorage `expiresAt`
- Check cookie `role` value (phải là UPPERCASE)

#### 4. **Race condition**

**Triệu chứng:**

- Console log "Session cookies set successfully"
- Nhưng middleware log `hasToken: false`

**Nguyên nhân:**

- Redirect quá nhanh, cookie chưa kịp set

**Cách fix:**

- ✅ Đã fix: Wait 200ms trước redirect
- ✅ Đã fix: Use `window.location.href` thay vì `router.replace()`

---

## 🔍 **Debug Commands**

### **Check tất cả trong Console:**

```javascript
// Paste vào browser console
console.log("=== AUTH DEBUG ===");
console.log("localStorage:", {
  accessToken: localStorage.getItem("accessToken")?.substring(0, 20) + "...",
  refreshToken: localStorage.getItem("refreshToken")?.substring(0, 20) + "...",
  expiresAt: localStorage.getItem("expiresAt"),
});
console.log("cookies:", document.cookie);
console.log("Current path:", window.location.pathname);
```

### **Clear everything:**

```javascript
// Paste vào browser console
localStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log("✅ Cleared all data. Reload page to login again.");
```

---

## 📊 **Expected Flow Diagram**

```
User → Login Form
  ↓
[AuthContext] login(credentials)
  ↓
[LoginUseCase] execute()
  ↓
[AuthRepository] login() → POST /api/Auth/login
  ↓
Backend returns: { token, refreshToken, expiresAt, authDTO }
  ↓
[TokenStorage] saveTokens() → localStorage
  ↓
[SessionCookie] setSession() → POST /api/auth/session
  ↓
API route sets cookies: token, role
  ↓
Wait 200ms
  ↓
window.location.href = redirectPath
  ↓
Browser navigates → Middleware runs
  ↓
[Middleware] Check req.cookies.get('token')
  ↓
hasAuth = true → Allow access
  ↓
Page loads successfully ✅
```

---

## 📝 **Test với các user role khác nhau:**

### **Admin User:**

```
Email: eswap@email.com (hoặc admin account)
Expected redirect: /dashboard
Middleware check: roleStr === 'ADMIN'
```

### **Customer User:**

```
Email: customer@email.com
Expected redirect: /home
Middleware check: No special restriction
```

### **Staff/Employee User:**

```
Email: staff@email.com
Expected redirect: /dashboardstaff
Middleware check: STAFF_PATHS allowed publicly
```

---

## 🚀 **Thử ngay:**

1. **Mở browser:** http://localhost:3002/login
2. **Mở DevTools:** F12
3. **Login:** Nhập email/password
4. **Quan sát:**
   - Console logs
   - Network requests
   - Cookies
   - Redirect behavior
5. **Report kết quả:** Nếu vẫn lỗi, gửi screenshots của:
   - Console logs
   - Network tab
   - Cookies
   - Server terminal logs

---

**Good luck! 🎉**
