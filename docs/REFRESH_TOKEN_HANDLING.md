# 🔄 Refresh Token Handling - Tổng kết

## ✅ **HIỆN TRẠNG: Đã có 3 cơ chế xử lý Refresh Token**

### **1. Clean Architecture (AuthContext) - MỚI** ✨

**File:** `src/presentation/contexts/AuthContext.tsx`

**Trigger:** Khi app khởi động và token đã hết hạn

```typescript
useEffect(() => {
  const checkAuth = async () => {
    if (tokenStorage.isTokenExpired()) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        // ✅ Sử dụng RefreshTokenUseCase (Clean Architecture)
        const newTokens = await refreshTokenUseCase.execute(refreshToken);
        tokenStorage.saveTokens(newTokens);
        await sessionCookie.setSession({...});
      }
    }
  };
}, []);
```

**Flow:**

```
App Startup → Check Token Expiry → RefreshTokenUseCase
    ↓
AuthRepository.refreshToken()
    ↓
POST /api/Auth/refresh { RefreshToken: "xxx" }
    ↓
Save new tokens → Continue app
```

---

### **2. Axios Interceptor (API calls) - CŨ** 📦

**File:** `src/lib/api.ts`

**Trigger:** Khi API call bất kỳ trả về 401 Unauthorized

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // ✅ Tự động refresh token
      const newAccessToken = await refreshAccessToken();

      // ✅ Retry original request
      const originalRequest = error.config;
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return axios(originalRequest);
    }
  }
);
```

**Flow:**

```
API Call → 401 Error → refreshAccessToken()
    ↓
POST /api/Auth/refresh { RefreshToken: "xxx" }
    ↓
Save new tokens → Retry original request
```

---

### **3. refreshAccessToken() Function - CŨ (Đã cập nhật)** 🔧

**File:** `src/lib/refreshToken.ts`

**Được gọi bởi:** Axios interceptor

```typescript
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  // ✅ Backend expects PascalCase
  const response = await axios.post(`${API_URL}/api/Auth/refresh`, {
    RefreshToken: refreshToken,
  });

  // ✅ Handle multiple response formats
  const newAccessToken = data.token ?? data.Token ?? data.accessToken;
  const newRefreshToken =
    data.refreshToken ?? data.RefreshToken ?? data.newRefreshToken;
  const expiresAt = data.expiresAt ?? data.ExpiresAt;

  // ✅ Save to localStorage
  localStorage.setItem("accessToken", newAccessToken);
  localStorage.setItem("refreshToken", newRefreshToken);
  localStorage.setItem("expiresAt", expiresAt);

  return newAccessToken;
};
```

---

## 🔧 **ĐÃ SỬA (Nov 7, 2025)**

### **1. AuthRepositoryAPI.refreshToken()**

**Trước:**

```typescript
body: JSON.stringify({ refreshToken }); // ❌ camelCase
```

**Sau:**

```typescript
body: JSON.stringify({ RefreshToken: refreshToken }); // ✅ PascalCase
```

### **2. refreshAccessToken() - Multiple format handling**

**Trước:**

```typescript
const { accessToken, newRefreshToken } = response.data; // ❌ Fixed format
```

**Sau:**

```typescript
const newAccessToken = data.token ?? data.Token ?? data.accessToken;
const newRefreshToken =
  data.refreshToken ?? data.RefreshToken ?? data.newRefreshToken;
const expiresAt = data.expiresAt ?? data.ExpiresAt;
// ✅ Flexible format handling
```

### **3. Save expiresAt**

**Trước:**

```typescript
localStorage.setItem("accessToken", accessToken);
localStorage.setItem("refreshToken", newRefreshToken);
// ❌ Không lưu expiresAt
```

**Sau:**

```typescript
localStorage.setItem("accessToken", newAccessToken);
localStorage.setItem("refreshToken", newRefreshToken);
localStorage.setItem("expiresAt", expiresAt);
// ✅ Lưu cả expiresAt để check expiry
```

---

## 📊 **REFRESH TOKEN FLOW MATRIX**

| Tình huống                      | Trigger                 | Handler               | Method             |
| ------------------------------- | ----------------------- | --------------------- | ------------------ |
| **App startup + expired token** | useEffect (AuthContext) | RefreshTokenUseCase   | Clean Architecture |
| **API call returns 401**        | Axios interceptor       | refreshAccessToken()  | Legacy             |
| **Manual refresh**              | Call refreshUser()      | GetCurrentUserUseCase | Clean Architecture |

---

## 🎯 **BACKEND API REQUIREMENTS**

### **Endpoint:**

```
POST /api/Auth/refresh
```

### **Request Format:**

```json
{
  "refreshToken": "your_refresh_token_here"
}
```

### **Response Format (Actual from Backend):**

```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresAt": "2025-11-07T04:52:22.6692286Z",
  "authDTO": {
    "userID": "12345",
    "username": "Admin",
    "email": "eswap@email.com",
    "phoneNumber": "0362744434",
    "stationName": null,
    "roleName": "Admin"
  }
}
```

### **Get Current User Endpoint:**

```
GET /api/Auth/me
Authorization: Bearer {token}
```

**Response Format:**

```json
{
  "userID": "12345",
  "username": "Admin",
  "email": "eswap@email.com",
  "phoneNumber": "0362744434",
  "stationName": null,
  "roleName": "Admin"
}
```

---

## ✅ **TOKEN LIFECYCLE**

```
1. Login
   └─> Receive: token, refreshToken, expiresAt
   └─> Save to: localStorage + cookies

2. Use token for API calls
   └─> Add: Authorization: Bearer {token}

3. Token expired (checked on app startup)
   └─> Call: RefreshTokenUseCase
   └─> POST: /api/Auth/refresh
   └─> Save: new tokens
   └─> Continue: app usage

4. API call returns 401
   └─> Axios interceptor catches
   └─> Call: refreshAccessToken()
   └─> POST: /api/Auth/refresh
   └─> Retry: original request

5. Refresh token expired/invalid
   └─> Clear: all tokens
   └─> Redirect: /login
```

---

## 🔐 **STORAGE STRATEGY**

### **localStorage (Client-side)**

```typescript
accessToken   → Used for API calls (Bearer token)
refreshToken  → Used to get new access token
expiresAt     → Check if token expired
```

### **Cookies (Server-side - for middleware)**

```typescript
token  → Middleware check authentication
role   → Middleware check authorization
```

---

## 🧪 **TESTING**

### **Test Case 1: Token Expiry on App Startup**

```typescript
1. Login → Get tokens
2. Manually set expiresAt to past time in localStorage
3. Refresh page
4. ✅ Should auto refresh token
5. ✅ App should continue working
```

### **Test Case 2: 401 During API Call**

```typescript
1. Login → Get tokens
2. Make API call (using axios instance)
3. Backend returns 401
4. ✅ Should auto refresh token
5. ✅ Should retry original request
6. ✅ Should succeed
```

### **Test Case 3: Refresh Token Expired**

```typescript
1. Login → Get tokens
2. Manually expire both tokens
3. Refresh page or make API call
4. ✅ Should redirect to /login
5. ✅ Should clear all tokens
```

---

## ⚠️ **COMMON ISSUES**

### **Issue 1: Refresh endpoint returns 400/401**

**Cause:** Backend expects different payload format

**Solution:** Check backend expects `refreshToken` or `RefreshToken`

### **Issue 2: Infinite refresh loop**

**Cause:** Refresh endpoint also returns 401

**Solution:** Don't retry refresh endpoint in interceptor

### **Issue 3: Token not saved after refresh**

**Cause:** Response parsing error

**Solution:** Check response format matches expected format

---

## 📝 **RECOMMENDATIONS**

### ✅ **Keep Both Mechanisms**

- **AuthContext (Clean Architecture)**: For proactive refresh on app startup
- **Axios Interceptor**: For reactive refresh when API returns 401

### ✅ **Unified Token Storage**

- Use `TokenStorageService` for all token operations
- Migrate `refreshAccessToken()` to use `TokenStorageService`

### ✅ **Error Handling**

- Log refresh failures
- Clear tokens on persistent failures
- Redirect to login gracefully

### ✅ **Future Improvements**

- Add retry logic with exponential backoff
- Implement token refresh queue (prevent multiple refreshes)
- Add telemetry for refresh failures

---

## 🎉 **SUMMARY**

| Component                            | Status         | Notes                   |
| ------------------------------------ | -------------- | ----------------------- |
| **RefreshTokenUseCase**              | ✅ Implemented | Clean Architecture      |
| **AuthRepositoryAPI.refreshToken()** | ✅ Fixed       | PascalCase payload      |
| **refreshAccessToken()**             | ✅ Updated     | Multiple format support |
| **Axios Interceptor**                | ✅ Working     | Auto retry on 401       |
| **AuthContext auto-refresh**         | ✅ Working     | On app startup          |
| **Token expiry check**               | ✅ Working     | TokenStorageService     |

**Hệ thống đã có đầy đủ xử lý refresh token tự động!** 🚀
