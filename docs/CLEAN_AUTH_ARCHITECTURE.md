# Clean Architecture - Auth Flow Documentation

## 📐 Kiến trúc Clean Architecture cho Authentication

### Cấu trúc Layers

```
┌─────────────────────────────────────────┐
│     Presentation Layer (UI)             │
│  - LoginForm, AuthContext               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Application Layer (Use Cases)       │
│  - LoginUseCase                         │
│  - LogoutUseCase                        │
│  - GetCurrentUserUseCase                │
│  - RefreshTokenUseCase                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Domain Layer (Entities & Rules)     │
│  - Auth Entity (UserRole, AuthUser)     │
│  - IAuthRepository Interface            │
│  - Business Rules (getRouteByRole)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Infrastructure Layer (External)     │
│  - AuthRepositoryAPI (Implementation)   │
│  - TokenStorageService                  │
│  - SessionCookieService                 │
└─────────────────────────────────────────┘
```

---

## 🔐 Login Flow - Clean Architecture

### 1️⃣ **Presentation Layer**

**File**: `src/presentation/components/ui/auth/login/LoginForm.tsx`

```typescript
// User nhập email/password
const handleSubmit = async (e) => {
  // Validation ở UI layer
  // Call AuthContext
  const result = await login({
    email: formData.email,
    password: formData.password,
  });
};
```

---

### 2️⃣ **Presentation Context**

**File**: `src/presentation/contexts/AuthContext.tsx`

```typescript
const login = async (credentials: LoginCredentials) => {
  // Execute Login Use Case
  const result = await loginUseCase.execute(credentials);

  if (result.success && result.data) {
    const { tokens, user, redirectPath } = result.data;

    // Save tokens (Infrastructure)
    tokenStorage.saveTokens(tokens);
    sessionCookie.setSession({...});

    // Update UI state
    setUser(user);
    setIsAuthenticated(true);

    // Redirect based on role
    router.replace(redirectPath);
  }
}
```

---

### 3️⃣ **Application Layer - Use Case**

**File**: `src/application/usecases/auth/LoginUseCase.ts`

```typescript
export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials) {
    // Business validation
    if (!credentials.email || !credentials.password) {
      return { success: false, message: "..." };
    }

    // Call Repository (Domain Interface)
    const authResponse = await this.authRepository.login(credentials);

    // Business Logic: Determine redirect path
    const redirectPath = getRouteByRole(authResponse.user.roleName);

    return {
      success: true,
      data: { ...authResponse, redirectPath },
    };
  }
}
```

---

### 4️⃣ **Domain Layer - Entities**

**File**: `src/domain/entities/Auth.ts`

```typescript
// Domain Entities (Pure Business Objects)
export enum UserRole {
  ADMIN = "Admin",
  EMPLOYEE = "Employee",
  STAFF = "Staff",
  DRIVER = "Driver",
  CUSTOMER = "Customer",
}

export interface AuthUser {
  userID: string;
  username: string;
  email: string;
  phoneNumber: string;
  stationName: string | null;
  roleName: UserRole;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

// Business Rule
export const getRouteByRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard";
    case UserRole.EMPLOYEE:
      return "/dashboardstaff";
    case UserRole.DRIVER:
      return "/home";
    case UserRole.CUSTOMER:
      return "/home";
    default:
      return "/home";
  }
};
```

---

### 5️⃣ **Domain Layer - Repository Interface**

**File**: `src/domain/repositories/AuthRepository.ts`

```typescript
// Repository Contract (Domain không biết Implementation)
export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  getCurrentUser(token: string): Promise<AuthUser>;
}
```

---

### 6️⃣ **Infrastructure Layer - Repository Implementation**

**File**: `src/infrastructure/repositories/AuthRepositoryAPI.impl.ts`

```typescript
export class AuthRepositoryAPI implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Call external API
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const json = await response.json();

    // Map external response to Domain Entity
    const tokens: AuthTokens = {
      token: json.token ?? json.Token,
      refreshToken: json.refreshToken ?? json.RefreshToken,
      expiresAt: json.expiresAt ?? json.ExpiresAt,
    };

    const user: AuthUser = {
      userID: json.authDTO.userID,
      username: json.authDTO.username,
      email: json.authDTO.email,
      phoneNumber: json.authDTO.phoneNumber,
      stationName: json.authDTO.stationName,
      roleName: normalizeRole(json.authDTO.roleName),
    };

    return { tokens, user };
  }
}
```

---

### 7️⃣ **Infrastructure Services**

**Token Storage** - `src/infrastructure/services/TokenStorageService.ts`

```typescript
class TokenStorageService {
  saveTokens(tokens: AuthTokens): void {
    localStorage.setItem("accessToken", tokens.token);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("expiresAt", tokens.expiresAt);
  }

  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
  }

  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    return new Date(expiresAt) <= new Date();
  }
}
```

**Session Cookie** - `src/infrastructure/services/SessionCookieService.ts`

```typescript
class SessionCookieService {
  async setSession(params: {
    token: string;
    role: UserRole;
    maxAge?: number;
  }): Promise<void> {
    await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async clearSession(): Promise<void> {
    await fetch("/api/auth/logout-local", {
      method: "POST",
    });
  }
}
```

---

## 🎯 Role-Based Routing

### API Response Example

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

### Role Mapping & Redirection

| Backend roleName | Normalized Role   | Redirect Path     |
| ---------------- | ----------------- | ----------------- |
| Admin            | UserRole.ADMIN    | `/dashboard`      |
| Employee         | UserRole.EMPLOYEE | `/dashboardstaff` |
| Staff            | UserRole.STAFF    | `/dashboardstaff` |
| Driver           | UserRole.DRIVER   | `/home`           |
| Customer         | UserRole.CUSTOMER | `/home`           |

**Implementation:**

```typescript
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

## ✅ Ưu điểm Clean Architecture

### 1. **Separation of Concerns**

- Mỗi layer có trách nhiệm riêng biệt
- UI không phụ thuộc vào API implementation
- Business logic độc lập với framework

### 2. **Testability**

```typescript
// Mock Repository cho testing Use Case
const mockRepo: IAuthRepository = {
  login: jest.fn().mockResolvedValue(mockAuthResponse),
};

const useCase = new LoginUseCase(mockRepo);
const result = await useCase.execute(credentials);
```

### 3. **Maintainability**

- Thay đổi API không ảnh hưởng Use Case
- Thêm/sửa business rule tập trung ở Domain
- Dễ dàng thay đổi UI framework

### 4. **Reusability**

- Use Cases có thể dùng cho nhiều UI khác nhau
- Domain entities có thể share giữa các modules
- Repository có thể swap (API → GraphQL → Mock)

### 5. **Type Safety**

- Strict typing ở mọi layer
- Domain entities là single source of truth
- Compile-time error detection

---

## 🔄 Complete Login Flow Sequence

```
User Input (Presentation)
    ↓
LoginForm.handleSubmit()
    ↓
AuthContext.login(credentials)
    ↓
LoginUseCase.execute(credentials)
    ↓  (validate input)
    ↓
IAuthRepository.login(credentials)
    ↓  (interface)
    ↓
AuthRepositoryAPI.login(credentials)
    ↓  (implementation)
    ↓
fetch('/api/auth/login')  ← External API Call
    ↓  (receive response)
    ↓
Map to Domain Entities (AuthResponse)
    ↓  (return to Use Case)
    ↓
getRouteByRole(user.roleName)  ← Business Rule
    ↓  (return to Context)
    ↓
tokenStorage.saveTokens()      ← Infrastructure
sessionCookie.setSession()     ← Infrastructure
    ↓
setUser(), setIsAuthenticated()  ← Update UI State
    ↓
router.replace(redirectPath)     ← Navigation
```

---

## 📝 Usage Examples

### Login

```typescript
import { useAuth } from "@/presentation/contexts/AuthContext";

const { login, loading } = useAuth();

const handleLogin = async () => {
  const result = await login({
    email: "admin@email.com",
    password: "123456",
  });

  if (result.success) {
    // Auto redirected based on role
  } else {
    console.error(result.message);
  }
};
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Auto redirected to /login
};
```

### Check Auth

```typescript
const { user, isAuthenticated } = useAuth();

if (isAuthenticated && user) {
  console.log(`Welcome ${user.username}!`);
  console.log(`Role: ${user.roleName}`);
}
```

---

## 🛡️ Middleware Protection

**File**: `src/middleware.ts`

```typescript
export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const roleStr = req.cookies.get("role")?.value;

  // Admin routes protection
  if (isAdminPath(pathname)) {
    if (!token) {
      return redirect("/login");
    }

    if (roleStr !== UserRole.ADMIN.toUpperCase()) {
      return redirect("/home");
    }
  }

  return NextResponse.next();
}
```

---

## 🎨 Clean Architecture Benefits Summary

| Aspect             | Traditional      | Clean Architecture   |
| ------------------ | ---------------- | -------------------- |
| **Coupling**       | Tight (UI ↔ API) | Loose (Interfaces)   |
| **Testing**        | Hard (need API)  | Easy (mock repos)    |
| **Changes**        | Ripple effect    | Isolated impact      |
| **Reusability**    | Low              | High                 |
| **Type Safety**    | Mixed            | Strict               |
| **Business Logic** | Scattered        | Centralized (Domain) |

---

## 📦 File Structure

```
src/
├── domain/
│   ├── entities/
│   │   └── Auth.ts                    # Domain Models & Business Rules
│   └── repositories/
│       └── AuthRepository.ts          # Repository Interface
│
├── application/
│   └── usecases/
│       └── auth/
│           ├── LoginUseCase.ts
│           ├── LogoutUseCase.ts
│           ├── GetCurrentUserUseCase.ts
│           └── RefreshTokenUseCase.ts
│
├── infrastructure/
│   ├── repositories/
│   │   └── AuthRepositoryAPI.impl.ts  # API Implementation
│   └── services/
│       ├── TokenStorageService.ts     # localStorage abstraction
│       └── SessionCookieService.ts    # Cookie management
│
└── presentation/
    ├── contexts/
    │   └── AuthContext.tsx            # React Context
    └── components/
        └── ui/auth/login/
            └── LoginForm.tsx          # UI Component
```

---

## 🚀 Next Steps

1. ✅ Login với role-based routing
2. ✅ Token storage & session management
3. ✅ Clean Architecture implementation
4. 🔄 Auto token refresh (already implemented)
5. 📱 Add other auth flows (register, forgot password) to Clean Architecture
6. 🧪 Write unit tests for Use Cases
7. 🔒 Enhance security (CSRF, XSS protection)

---

**🎯 Key Takeaway**: Clean Architecture tách biệt business logic khỏi implementation details, giúp code dễ maintain, test và scale!
