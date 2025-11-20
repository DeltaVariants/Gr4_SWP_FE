# 🐛 DEBUG: Login Redirect Issue

## Vấn đề

Đăng nhập thành công nhưng bị redirect về lại trang login.

## Nguyên nhân

Middleware check cookie `token` và `role` để xác thực, nhưng cookie chưa được set kịp trước khi redirect.

## Các bước đã sửa

### 1. ✅ Thêm logging vào AuthContext

- Log quá trình login chi tiết
- Log khi set cookies
- Check xem cookies có được set thành công không

### 2. ✅ Cải thiện SessionCookieService

- Return `true/false` để biết cookies có set thành công
- Handle error tốt hơn
- Log chi tiết lỗi nếu có

### 3. ✅ Thêm logging vào Middleware

- Log pathname, token, role khi middleware chạy
- Dễ debug xem middleware nhận được cookie chưa

### 4. ✅ Tăng delay trước redirect

- Tăng từ 100ms lên 200ms
- Đảm bảo API `/api/auth/session` hoàn thành

### 5. ✅ Chặn redirect nếu cookie failed

- Nếu set cookie thất bại, return error ngay
- Không redirect để tránh loop

## Cách test

### Test 1: Check console logs

```
1. Mở DevTools → Console tab
2. Login
3. Xem logs:
   [Auth] Starting login process...
   [Auth] Login successful: { user: "...", role: "...", redirectPath: "..." }
   [Auth] Tokens saved to localStorage
   [Auth] Setting session cookies...
   [Auth] Session cookies set successfully
   [Auth] Redirecting to: /dashboard (hoặc /home, /dashboardstaff)
```

### Test 2: Check cookies

```
1. Mở DevTools → Application tab → Cookies
2. Check xem có 2 cookies:
   - token: <JWT token>
   - role: ADMIN (hoặc CUSTOMER, EMPLOYEE, STAFF)
```

### Test 3: Check Network tab

```
1. Mở DevTools → Network tab
2. Login
3. Check request đến:
   - POST /api/Auth/login → 200 OK
   - POST /api/auth/session → 200 OK { success: true }
```

### Test 4: Check middleware logs (Server console)

```
1. Check terminal chạy `npm run dev`
2. Sau khi login, xem log:
   [Middleware] {
     pathname: '/dashboard',
     hasToken: true,
     role: 'ADMIN',
     hasAuth: true
   }
```

## Expected Flow

```
1. User nhập email/password → Click Login
   ↓
2. LoginUseCase.execute() → Call backend
   ↓
3. Backend return: { token, refreshToken, expiresAt, authDTO }
   ↓
4. Save to localStorage: accessToken, refreshToken, expiresAt
   ↓
5. Call POST /api/auth/session
   ↓
6. API route set cookies: token, role
   ↓
7. Wait 200ms for cookies to be set
   ↓
8. window.location.href = redirectPath
   ↓
9. Browser navigate → Middleware runs
   ↓
10. Middleware check cookies → Found token + role
   ↓
11. Allow access → Page loads successfully ✅
```

## Common Issues

### Issue 1: Cookies not found in middleware

**Symptoms:** Middleware log shows `hasToken: false`

**Solutions:**

- Check DevTools → Application → Cookies
- Make sure `httpOnly: true` for token
- Make sure `path: '/'` for both cookies
- Check `sameSite: 'lax'` setting

### Issue 2: API /api/auth/session returns error

**Symptoms:** Console shows "Failed to set session cookies"

**Solutions:**

- Check API route exists: `src/app/api/auth/session/route.ts`
- Check request payload: `{ token, role, maxAge }`
- Check response: `{ success: true }`

### Issue 3: Redirect happens before cookies are set

**Symptoms:**

- Console shows "Session cookies set successfully"
- But middleware still can't find cookies
- Race condition

**Solutions:**

- ✅ Already fixed: Wait 200ms before redirect
- ✅ Use `window.location.href` instead of `router.replace()`

### Issue 4: Role mismatch

**Symptoms:** User logs in but redirected to wrong page or back to login

**Solutions:**

- Check role normalization in `normalizeRole()` function
- Backend returns: "Admin" → Frontend expects: "ADMIN"
- Middleware uppercases role: `.toUpperCase()`

## Debugging Commands

### Check localStorage

```javascript
// Paste in browser console
console.log({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  expiresAt: localStorage.getItem("expiresAt"),
});
```

### Check cookies manually

```javascript
// Paste in browser console
document.cookie.split(";").forEach((c) => console.log(c.trim()));
```

### Clear everything and retry

```javascript
// Paste in browser console
localStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

## Next Steps

1. **Test login flow** với console logs
2. **Check cookies** trong DevTools
3. **Check middleware logs** trong terminal
4. **Report kết quả** để tiếp tục debug nếu còn lỗi

---

**Nếu vẫn bị redirect về login, hãy gửi:**

- Screenshot console logs (browser DevTools)
- Screenshot cookies (Application tab)
- Screenshot Network tab (request/response)
- Server logs từ terminal
