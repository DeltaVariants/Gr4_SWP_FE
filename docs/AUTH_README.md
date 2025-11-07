# 🔐 Authentication System - Clean Architecture

## 📋 Tổng quan

Hệ thống Authentication được xây dựng theo **Clean Architecture** với:

- ✅ Role-based routing (Admin → /dashboard, Staff/Employee → /dashboardstaff, Driver/Customer → /home)
- ✅ JWT Token authentication
- ✅ Auto token refresh
- ✅ Type-safe với TypeScript
- ✅ Separation of concerns

---

## 🎯 Quick Start

### 1. Login Example

```tsx
import { useAuth } from "@/presentation/contexts/AuthContext";

function LoginPage() {
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: "admin@email.com",
      password: "123456",
    });

    if (result.success) {
      // ✅ Auto redirect based on role:
      // - Admin → /dashboard
      // - Employee/Staff → /dashboardstaff
      // - Driver/Customer → /home
    } else {
      console.error(result.message);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      Login
    </button>
  );
}
```

### 2. Check Authentication

```tsx
import { useAuth } from "@/presentation/contexts/AuthContext";

function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.username}!</h1>
      <p>Role: {user?.roleName}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### 3. Logout

```tsx
import { useAuth } from "@/presentation/contexts/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
}
```

---

## 🏗️ Architecture

### Layer Structure

```
Presentation Layer (UI)
    ↓
Application Layer (Use Cases)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure Layer (External APIs)
```

### Files Overview

| Layer              | File                                     | Responsibility         |
| ------------------ | ---------------------------------------- | ---------------------- |
| **Presentation**   | `contexts/AuthContext.tsx`               | React state management |
| **Presentation**   | `components/ui/auth/login/LoginForm.tsx` | UI component           |
| **Application**    | `usecases/auth/LoginUseCase.ts`          | Login business logic   |
| **Domain**         | `entities/Auth.ts`                       | Domain models & rules  |
| **Domain**         | `repositories/AuthRepository.ts`         | Repository interface   |
| **Infrastructure** | `repositories/AuthRepositoryAPI.impl.ts` | API implementation     |
| **Infrastructure** | `services/TokenStorageService.ts`        | Token storage          |
| **Infrastructure** | `services/SessionCookieService.ts`       | Cookie management      |

---

## 🔐 API Response Format

### Login Endpoint

```
POST /api/Auth/login
```

**Request:**

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGc...",
  "refreshToken": "refresh_token_here",
  "expiresAt": "2025-11-07T11:28:42.1824902Z",
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

---

## 🎨 Role-Based Routing

| Backend Role | Normalized Role     | Redirect Path     |
| ------------ | ------------------- | ----------------- |
| `Admin`      | `UserRole.ADMIN`    | `/dashboard`      |
| `Employee`   | `UserRole.EMPLOYEE` | `/dashboardstaff` |
| `Staff`      | `UserRole.STAFF`    | `/dashboardstaff` |
| `Driver`     | `UserRole.DRIVER`   | `/home`           |
| `Customer`   | `UserRole.CUSTOMER` | `/home`           |

**Implementation:**

```typescript
// src/domain/entities/Auth.ts
export const getRouteByRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard";
    case UserRole.EMPLOYEE:
    case UserRole.STAFF:
      return "/dashboardstaff";
    case UserRole.DRIVER:
    case UserRole.CUSTOMER:
      return "/home";
    default:
      return "/home";
  }
};
```

---

## 🛡️ Middleware Protection

**File:** `src/middleware.ts`

```typescript
// Automatically protects routes based on role
// - /dashboard/* → requires Admin role
// - /dashboardstaff/* → public (no auth required)
// - /profile → requires authentication

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  if (isAdminPath && role !== UserRole.ADMIN) {
    return redirect("/home");
  }

  return NextResponse.next();
}
```

---

## 🔄 Complete Login Flow

```
1. User Input
   └─> LoginForm.tsx

2. UI Layer
   └─> AuthContext.login()

3. Use Case
   └─> LoginUseCase.execute()
       ├─> Validate email/password
       └─> Call repository

4. Repository (Interface)
   └─> IAuthRepository.login()

5. Repository (Implementation)
   └─> AuthRepositoryAPI.login()
       └─> fetch('/api/auth/login')

6. Response Mapping
   └─> Map API response to Domain Entity
       ├─> AuthTokens
       └─> AuthUser

7. Business Rule
   └─> getRouteByRole(user.roleName)

8. State Update
   ├─> tokenStorage.saveTokens()
   ├─> sessionCookie.setSession()
   ├─> setUser()
   └─> setIsAuthenticated()

9. Navigation
   └─> router.replace(redirectPath)
```

---

## 💾 Token Management

### Storage

```typescript
// Automatic token management
tokenStorage.saveTokens({
  token: "access_token",
  refreshToken: "refresh_token",
  expiresAt: "2025-11-07T11:28:42Z",
});

// Auto-check expiry
if (tokenStorage.isTokenExpired()) {
  // Auto refresh token
}
```

### Refresh Token Flow

```typescript
// Automatically triggered when token expires
const newTokens = await refreshTokenUseCase.execute(refreshToken);
tokenStorage.saveTokens(newTokens);
```

---

## 🧪 Testing

### Unit Test Use Case

```typescript
import { LoginUseCase } from '@/application/usecases/auth/LoginUseCase';
import { IAuthRepository } from '@/domain/repositories/AuthRepository';

describe('LoginUseCase', () => {
  it('should return redirect path based on role', async () => {
    // Mock repository
    const mockRepo: IAuthRepository = {
      login: jest.fn().mockResolvedValue({
        tokens: { token: 'xxx', refreshToken: 'yyy', expiresAt: '...' },
        user: { roleName: UserRole.ADMIN, ... }
      })
    };

    // Test use case
    const useCase = new LoginUseCase(mockRepo);
    const result = await useCase.execute({
      email: 'admin@email.com',
      password: '123456'
    });

    expect(result.success).toBe(true);
    expect(result.data?.redirectPath).toBe('/dashboard');
  });
});
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "typescript": "^5.x"
  }
}
```

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://gr4-swp-be2-sp25.onrender.com

# Optional: Dev mode bypass authentication
NEXT_PUBLIC_API_TOKEN=your_dev_token_here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test Login

Navigate to http://localhost:3000/login and login with:

- Email: `admin@email.com`
- Password: `123456`

---

## ✨ Features

### ✅ Implemented

- [x] Login with role-based routing
- [x] Logout
- [x] Auto token refresh
- [x] Token storage (localStorage + cookie)
- [x] Middleware protection
- [x] Type-safe architecture
- [x] Error handling

### 🔄 Todo

- [ ] Register with Clean Architecture
- [ ] Forgot/Reset Password with Clean Architecture
- [ ] Email Verification with Clean Architecture
- [ ] Unit tests for Use Cases
- [ ] Integration tests
- [ ] CSRF protection
- [ ] Rate limiting

---

## 📚 Documentation

- [Clean Architecture Guide](./CLEAN_AUTH_ARCHITECTURE.md)
- [API Documentation](./API_DOCS.md)
- [Admin Auth Summary](../ADMIN_AUTH_SUMMARY.md)

---

## 🤝 Contributing

1. Create feature branch
2. Implement following Clean Architecture
3. Write tests
4. Submit PR

---

## 📝 License

MIT

---

**Made with ❤️ using Clean Architecture**
