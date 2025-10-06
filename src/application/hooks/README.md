# Application Hooks

Thư mục này chứa các custom hooks phục vụ cho Application layer trong Clean Architecture.

## Mục đích

Application hooks là các custom React hooks chứa logic nghiệp vụ và điều phối giữa các use cases với UI components. Chúng hoạt động như một bridge giữa presentation layer và domain/infrastructure layers.

## Cấu trúc và Quy ước

### Cấu trúc file

```
hooks/
├── useAuth.ts           # Authentication logic
├── useUser.ts           # User management logic
├── useProduct.ts        # Product operations
└── useApi.ts            # Generic API operations
```

### Quy ước đặt tên

- Sử dụng prefix `use` theo convention của React hooks
- Tên hook phản ánh feature hoặc domain mà nó quản lý
- Sử dụng camelCase: `useUserProfile`, `useProductList`

## Ví dụ Implementation

### Basic Hook Structure

```typescript
import { useState, useEffect } from "react";
import { UserService } from "../services/UserService";
import { User } from "../../domain/entities/User";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const userService = new UserService();
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    // Update logic
  };

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
  };
};
```

### Hook với Dependency Injection

```typescript
import { useMemo } from "react";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { ApiUserRepository } from "../../infrastructure/repositories/ApiUserRepository";

export const useUserWithDI = (repository?: UserRepository) => {
  const userRepo = useMemo(
    () => repository || new ApiUserRepository(),
    [repository]
  );

  // Hook logic using injected repository
  return {
    // Hook interface
  };
};
```

## Best Practices

1. **Single Responsibility**: Mỗi hook chỉ quản lý một domain/feature cụ thể
2. **Error Handling**: Luôn xử lý và expose error state
3. **Loading States**: Cung cấp loading indicators cho async operations
4. **Dependency Injection**: Cho phép inject dependencies để dễ testing
5. **Return Object**: Return object thay vì array để dễ destructuring
6. **Memoization**: Sử dụng useMemo, useCallback khi cần thiết để optimize performance

## Testing

```typescript
// hooks/__tests__/useUser.test.ts
import { renderHook, act } from "@testing-library/react";
import { useUser } from "../useUser";

describe("useUser", () => {
  it("should fetch user successfully", async () => {
    const { result } = renderHook(() => useUser());

    await act(async () => {
      await result.current.fetchUser("123");
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

## Lưu ý

- Hooks chỉ chứa logic điều phối, không chứa business rules (business rules thuộc domain layer)
- Sử dụng services từ application/services để thực hiện operations
- Không trực tiếp gọi API từ hooks, sử dụng repositories thông qua services
- Hooks có thể sử dụng state management (Redux, Zustand) nếu cần
