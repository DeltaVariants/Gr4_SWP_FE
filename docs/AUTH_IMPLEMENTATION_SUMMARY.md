# ✅ Cải thiện Auth Login - Clean Architecture

## 🎯 Đã hoàn thành

### 1. **Áp dụng Clean Architecture**

#### ✅ Domain Layer (Business Logic)

- `src/domain/entities/Auth.ts` - Domain entities & business rules

  - `UserRole` enum (Admin, Employee, Staff, Driver, Customer)
  - `AuthUser`, `LoginCredentials`, `AuthTokens`, `AuthResponse`
  - `getRouteByRole()` - Business rule cho role-based routing
  - `normalizeRole()` - Normalize role từ backend

- `src/domain/repositories/AuthRepository.ts` - Repository interface
  - Định nghĩa contract cho authentication operations
  - Không phụ thuộc vào implementation

#### ✅ Application Layer (Use Cases)

- `src/application/usecases/auth/LoginUseCase.ts`
  - Input validation (email format, required fields)
  - Gọi repository để login
  - Apply business rule: determine redirect path based on role
- `src/application/usecases/auth/LogoutUseCase.ts`
- `src/application/usecases/auth/GetCurrentUserUseCase.ts`
- `src/application/usecases/auth/RefreshTokenUseCase.ts`

#### ✅ Infrastructure Layer (External Dependencies)

- `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`

  - Implement IAuthRepository interface
  - Handle API calls với Next.js API proxy
  - Normalize backend response (PascalCase/camelCase)
  - Map external data to domain entities

- `src/infrastructure/services/TokenStorageService.ts`

  - Abstract localStorage operations
  - Token expiry checking
  - Type-safe token management

- `src/infrastructure/services/SessionCookieService.ts`
  - Server-side cookie management
  - Set/clear session cookies for middleware

#### ✅ Presentation Layer (UI)

- `src/presentation/contexts/AuthContext.tsx`

  - React Context với Clean Architecture
  - Inject use cases (dependency injection)
  - State management (user, loading, isAuthenticated)
  - Auto check auth on startup
  - Auto refresh expired tokens

- `src/presentation/components/ui/auth/login/LoginForm.tsx`
  - Updated import path to use new AuthContext

---

### 2. **Role-Based Routing Logic**

```typescript
// Domain business rule
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

**Mapping table:**

| Backend roleName | Normalized        | Redirect Path     |
| ---------------- | ----------------- | ----------------- |
| Admin            | UserRole.ADMIN    | `/dashboard`      |
| Employee         | UserRole.EMPLOYEE | `/dashboardstaff` |
| Staff            | UserRole.STAFF    | `/dashboardstaff` |
| Driver           | UserRole.DRIVER   | `/home`           |
| Customer         | UserRole.CUSTOMER | `/home`           |

---

### 3. **API Integration**

#### Request Format

```typescript
POST /api/Auth/login
{
  "email": "admin@email.com",
  "password": "123456"
}
```

#### Response Format (Normalized)

```typescript
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

#### Response Normalization

- Hỗ trợ cả PascalCase và camelCase từ backend
- Map to strict Domain entities
- Type-safe với TypeScript

---

### 4. **Complete Login Flow**

```
User Input (LoginForm)
    ↓
AuthContext.login(credentials)
    ↓
LoginUseCase.execute(credentials)
    ├─> Validate email format
    ├─> Validate required fields
    └─> authRepository.login(credentials)
            ↓
        AuthRepositoryAPI.login()
            ├─> fetch('/api/auth/login')
            ├─> Normalize response
            └─> Map to Domain Entities
                    ↓
                Return AuthResponse
    ↓
getRouteByRole(user.roleName)  ← Business Rule
    ↓
tokenStorage.saveTokens(tokens)
sessionCookie.setSession({ token, role })
    ↓
setUser(userData)
setIsAuthenticated(true)
    ↓
router.replace(redirectPath)
```

---

### 5. **Middleware Protection**

Updated `src/middleware.ts`:

```typescript
import { UserRole } from "@/domain/entities/Auth";

// Check role from cookie
if (roleStr !== UserRole.ADMIN.toUpperCase()) {
  return redirect("/home");
}
```

---

### 6. **Provider Setup**

Updated `src/app/provider.tsx`:

```tsx
export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </ReduxProvider>
  );
}
```

---

## 📦 Created Files

### Domain Layer

- ✅ `src/domain/entities/Auth.ts`
- ✅ `src/domain/repositories/AuthRepository.ts`

### Application Layer

- ✅ `src/application/usecases/auth/LoginUseCase.ts`
- ✅ `src/application/usecases/auth/LogoutUseCase.ts`
- ✅ `src/application/usecases/auth/GetCurrentUserUseCase.ts`
- ✅ `src/application/usecases/auth/RefreshTokenUseCase.ts`
- ✅ `src/application/usecases/auth/index.ts`

### Infrastructure Layer

- ✅ `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`
- ✅ `src/infrastructure/services/TokenStorageService.ts`
- ✅ `src/infrastructure/services/SessionCookieService.ts`

### Presentation Layer

- ✅ `src/presentation/contexts/AuthContext.tsx`

### Documentation

- ✅ `docs/CLEAN_AUTH_ARCHITECTURE.md`
- ✅ `docs/AUTH_README.md`
- ✅ `docs/AUTH_IMPLEMENTATION_SUMMARY.md` (this file)

---

## 📝 Updated Files

- ✅ `src/middleware.ts` - Sử dụng UserRole từ domain
- ✅ `src/app/provider.tsx` - Thêm AuthProvider
- ✅ `src/presentation/components/ui/auth/login/LoginForm.tsx` - Update import path

---

## 🎨 Architecture Benefits

### ✅ Separation of Concerns

- UI không biết về API implementation
- Business logic tập trung ở Domain layer
- Infrastructure có thể swap dễ dàng

### ✅ Testability

```typescript
// Mock repository để test Use Case
const mockRepo: IAuthRepository = {
  login: jest.fn().mockResolvedValue(mockData),
};
const useCase = new LoginUseCase(mockRepo);
```

### ✅ Type Safety

- Strict TypeScript types ở mọi layer
- Domain entities là single source of truth
- Compile-time error detection

### ✅ Maintainability

- Thay đổi API không ảnh hưởng Use Case
- Business rules rõ ràng ở Domain
- Dễ refactor và extend

### ✅ Reusability

- Use Cases có thể dùng cho mobile app
- Domain logic platform-agnostic
- Repository có thể swap (REST → GraphQL)

---

## 🧪 Usage Example

### Login

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
      // Auto redirect to:
      // - Admin → /dashboard
      // - Employee/Staff → /dashboardstaff
      // - Driver/Customer → /home
    }
  };
}
```

### Check Auth

```tsx
const { user, isAuthenticated } = useAuth();

if (isAuthenticated && user) {
  console.log(`Welcome ${user.username}!`);
  console.log(`Role: ${user.roleName}`);
  console.log(`Email: ${user.email}`);
}
```

---

## 🚀 Next Steps

### ✅ Completed

- [x] Clean Architecture structure
- [x] Login with role-based routing
- [x] Token management
- [x] Auto token refresh
- [x] Middleware protection
- [x] Type-safe implementation

### 🔄 Recommended

- [ ] Apply Clean Architecture to Register
- [ ] Apply Clean Architecture to Forgot/Reset Password
- [ ] Write unit tests for Use Cases
- [ ] Add integration tests
- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Enhanced error handling
- [ ] Logging & monitoring

---

## 📚 Documentation

Xem thêm chi tiết tại:

- [Clean Auth Architecture Guide](./CLEAN_AUTH_ARCHITECTURE.md) - Chi tiết về kiến trúc
- [Auth README](./AUTH_README.md) - Hướng dẫn sử dụng

---

## ✨ Key Improvements

| Before                         | After                         |
| ------------------------------ | ----------------------------- |
| Logic scattered in AuthContext | Separated into layers         |
| Direct API calls               | Repository pattern            |
| Hard to test                   | Easy to mock & test           |
| Coupling between layers        | Loose coupling via interfaces |
| Mixed concerns                 | Clear responsibilities        |
| Manual role checking           | Business rule in Domain       |
| Inconsistent types             | Strict TypeScript             |

---

**🎯 Kết quả**: Hệ thống Authentication với Clean Architecture, role-based routing tự động, type-safe, dễ maintain và test!
