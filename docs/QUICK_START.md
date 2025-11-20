# 🚀 Quick Start - Auth System với Clean Architecture

## 📖 Tổng quan nhanh

Hệ thống Auth đã được refactor theo **Clean Architecture** với:

- ✅ **Auto redirect** theo role (Admin→/dashboard, Staff→/dashboardstaff, Customer→/home)
- ✅ **Type-safe** với TypeScript
- ✅ **Easy to test** với dependency injection
- ✅ **Maintainable** với separation of concerns

---

## 🎯 Cách sử dụng (Developer)

### 1. Import AuthContext

```tsx
import { useAuth } from "@/presentation/contexts/AuthContext";
```

### 2. Login

```tsx
function MyLoginComponent() {
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: "admin@email.com",
      password: "123456",
    });

    if (result.success) {
      // ✅ Auto redirect dựa trên role
      // Không cần code thêm gì!
    } else {
      alert(result.message); // Error message
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? "Loading..." : "Login"}
    </button>
  );
}
```

### 3. Check user đang login

```tsx
function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Hello {user?.username}!</h1>
      <p>Your role: {user?.roleName}</p>
    </div>
  );
}
```

### 4. Logout

```tsx
function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
}
```

---

## 🔑 API Response Example

Backend trả về format này:

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

### Role Mapping

| roleName từ BE           | Redirect đến      |
| ------------------------ | ----------------- |
| `Admin`                  | `/dashboard`      |
| `Employee` hoặc `Staff`  | `/dashboardstaff` |
| `Driver` hoặc `Customer` | `/home`           |

---

## 🏗️ Kiến trúc (cho developer cần hiểu sâu)

### Cấu trúc thư mục

```
src/
├── domain/                    # Business Logic (CORE)
│   ├── entities/
│   │   └── Auth.ts           # UserRole, AuthUser, business rules
│   └── repositories/
│       └── AuthRepository.ts  # Interface (contract)
│
├── application/               # Use Cases
│   └── usecases/auth/
│       ├── LoginUseCase.ts   # Login workflow
│       ├── LogoutUseCase.ts
│       └── ...
│
├── infrastructure/            # External Services
│   ├── repositories/
│   │   └── AuthRepositoryAPI.impl.ts  # API implementation
│   └── services/
│       ├── TokenStorageService.ts     # localStorage wrapper
│       └── SessionCookieService.ts    # Cookie management
│
└── presentation/              # UI Layer
    ├── contexts/
    │   └── AuthContext.tsx   # React Context
    └── components/...
```

### Data Flow

```
UI Component
    ↓
AuthContext (React)
    ↓
LoginUseCase (Business Logic)
    ↓
IAuthRepository Interface
    ↓
AuthRepositoryAPI Implementation
    ↓
Backend API
```

---

## 🧪 Testing (Example)

### Mock Use Case

```typescript
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
  email: 'test@email.com',
  password: '123456'
});

expect(result.success).toBe(true);
expect(result.data?.redirectPath).toBe('/dashboard');
```

---

## 📝 Thêm Use Case mới (Example)

### 1. Tạo Use Case

```typescript
// src/application/usecases/auth/VerifyEmailUseCase.ts
export class VerifyEmailUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(token: string): Promise<{ success: boolean }> {
    // Validation
    if (!token) {
      throw new Error("Token is required");
    }

    // Call repository
    await this.authRepository.verifyEmail(token);

    return { success: true };
  }
}
```

### 2. Thêm method vào Repository Interface

```typescript
// src/domain/repositories/AuthRepository.ts
export interface IAuthRepository {
  // ... existing methods
  verifyEmail(token: string): Promise<void>;
}
```

### 3. Implement trong Infrastructure

```typescript
// src/infrastructure/repositories/AuthRepositoryAPI.impl.ts
export class AuthRepositoryAPI implements IAuthRepository {
  async verifyEmail(token: string): Promise<void> {
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }
  }
}
```

### 4. Sử dụng trong AuthContext

```typescript
// src/presentation/contexts/AuthContext.tsx
const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);

const verifyEmail = async (token: string) => {
  const result = await verifyEmailUseCase.execute(token);
  return result;
};
```

---

## ⚠️ Common Mistakes

### ❌ KHÔNG NÊN

```typescript
// WRONG: Call API trực tiếp từ UI
const handleLogin = async () => {
  const response = await fetch('/api/auth/login', ...);
  // ❌ Vi phạm Clean Architecture
};
```

### ✅ NÊN

```typescript
// CORRECT: Use AuthContext
const { login } = useAuth();
const handleLogin = async () => {
  await login(credentials);
  // ✅ Đúng theo Clean Architecture
};
```

---

## 🔒 Middleware Protection

Middleware tự động protect routes:

```typescript
// middleware.ts
// Admin routes: /dashboard, /battery-management, etc.
// → Yêu cầu role = Admin

// Staff routes: /dashboardstaff, /reservations, etc.
// → Public access

// Auth routes: /profile
// → Yêu cầu đăng nhập
```

**Không cần code gì thêm!** Middleware tự động check.

---

## 📦 Dependencies

Đảm bảo installed:

```bash
npm install
```

Environment variables (`.env.local`):

```env
NEXT_PUBLIC_API_URL=https://gr4-swp-be2-sp25.onrender.com
```

---

## 🐛 Troubleshooting

### Problem: Login không redirect

**Solution**: Check console logs, verify backend response format

### Problem: Token expired

**Solution**: System tự động refresh, nếu fail thì logout

### Problem: Wrong redirect path

**Solution**: Check `roleName` từ backend, verify mapping trong `getRouteByRole()`

---

## 📚 Đọc thêm

- [Clean Architecture Guide](./CLEAN_AUTH_ARCHITECTURE.md) - Chi tiết architecture
- [Auth README](./AUTH_README.md) - Full documentation
- [Implementation Summary](./AUTH_IMPLEMENTATION_SUMMARY.md) - Tổng kết
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) - Visual diagrams

---

## 🆘 Support

Gặp vấn đề? Check:

1. Console logs (browser DevTools)
2. Network tab (API responses)
3. Documentation files ở trên
4. Ask team lead

---

**Happy coding! 🚀**
