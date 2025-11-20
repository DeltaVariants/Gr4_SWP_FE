# 🔌 Backend API Endpoints Reference

## 📍 Base URL

```
https://gr4-swp-be2-sp25.onrender.com
```

Trong code: `${API_URL}` với `.env`:

```
NEXT_PUBLIC_API_URL=https://gr4-swp-be2-sp25.onrender.com/api
```

---

## 🔐 Authentication Endpoints

### 1. **Login**

```http
POST /api/Auth/login
Content-Type: application/json
```

**Request:**

```json
{
  "Email": "eswap@email.com",
  "Password": "your_password"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123xyz...",
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

**Frontend Implementation:**

- File: `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`
- Method: `login(credentials)`
- Endpoint: `${API_URL}/Auth/login`
- Payload: `{ Email, Password }` (PascalCase)

---

### 2. **Refresh Token**

```http
POST /api/Auth/refresh
Content-Type: application/json
```

**Request:**

```json
{
  "refreshToken": "abc123xyz..."
}
```

**Response (200 OK):**

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

**Frontend Implementation:**

- File: `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`
- Method: `refreshToken(refreshToken)`
- Endpoint: `${API_URL}/Auth/refresh`
- Payload: `{ refreshToken }` (camelCase)
- Also used in: `src/lib/refreshToken.ts`

---

### 3. **Get Current User**

```http
GET /api/Auth/me
Authorization: Bearer {token}
```

**Request:**

- No body
- Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Response (200 OK):**

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

**Frontend Implementation:**

- File: `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`
- Method: `getCurrentUser(token)`
- Endpoint: `${API_URL}/Auth/me`
- Headers: `Authorization: Bearer {token}`

---

## ⚠️ **IMPORTANT NOTES**

### **PascalCase vs camelCase**

| Endpoint | Path Casing              | Request Body Casing            | Notes                 |
| -------- | ------------------------ | ------------------------------ | --------------------- |
| Login    | `/Auth/login` (Pascal)   | `{ Email, Password }` (Pascal) | Consistent PascalCase |
| Refresh  | `/Auth/refresh` (Pascal) | `{ refreshToken }` (camel)     | ⚠️ Mixed casing       |
| Get Me   | `/Auth/me` (Pascal)      | N/A (GET)                      | No body               |

**Key Difference:**

- **Login payload:** Uses PascalCase `Email`, `Password`
- **Refresh payload:** Uses camelCase `refreshToken` (NOT `RefreshToken`)

---

## 🚫 **Endpoints NOT Available in Backend**

These are **Next.js API routes** (frontend only), not backend:

| Endpoint                 | Type | Purpose                                  |
| ------------------------ | ---- | ---------------------------------------- |
| `/api/auth/session`      | POST | Set cookies for middleware               |
| `/api/auth/logout-local` | POST | Clear cookies                            |
| `/api/auth/me`           | GET  | ❌ Wrong path (should be `/api/Auth/me`) |
| `/api/auth/register`     | POST | Might be frontend proxy                  |

---

## 📝 **Response Format Patterns**

### **Token Response:**

```typescript
{
  token: string;           // JWT access token
  refreshToken: string;    // Refresh token
  expiresAt: string;       // ISO 8601 datetime
  authDTO?: {              // User info (optional, included in login & refresh)
    userID: string;
    username: string;
    email: string;
    phoneNumber: string;
    stationName: string | null;
    roleName: string;      // "Admin" | "Employee" | "Staff" | "Driver" | "Customer"
  }
}
```

### **User Response (from /Auth/me):**

```typescript
{
  userID: string;
  username: string;
  email: string;
  phoneNumber: string;
  stationName: string | null;
  roleName: string;
}
```

---

## 🔧 **Frontend Code Mapping**

### **AuthRepositoryAPI.impl.ts**

```typescript
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gr4-swp-be2-sp25.onrender.com";

// Login
fetch(`${API_URL}/Auth/login`, {
  method: "POST",
  body: JSON.stringify({ Email, Password }),
});

// Refresh
fetch(`${API_URL}/Auth/refresh`, {
  method: "POST",
  body: JSON.stringify({ refreshToken }), // ⚠️ camelCase!
});

// Get current user
fetch(`${API_URL}/Auth/me`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 🧪 **Testing with cURL**

### **Login:**

```bash
curl -X POST https://gr4-swp-be2-sp25.onrender.com/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "eswap@email.com",
    "Password": "your_password"
  }'
```

### **Refresh:**

```bash
curl -X POST https://gr4-swp-be2-sp25.onrender.com/api/Auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

### **Get Me:**

```bash
curl -X GET https://gr4-swp-be2-sp25.onrender.com/api/Auth/me \
  -H "Authorization: Bearer your_access_token"
```

---

## 📚 **Related Documentation**

- **Clean Architecture:** `docs/CLEAN_AUTH_ARCHITECTURE.md`
- **Refresh Token Flow:** `docs/REFRESH_TOKEN_HANDLING.md`
- **Login Debug Guide:** `docs/LOGIN_DEBUG.md`

---

**Last Updated:** November 7, 2025
