# Application Slices (Redux Toolkit Slices)

Thư mục này chứa các Redux Toolkit slices để quản lý state trong ứng dụng theo pattern Clean Architecture.

## Mục đích

Application slices chứa:

- Global state management
- Actions và reducers
- Async thunks cho API calls
- Selectors để truy xuất state
- State normalization

## Cấu trúc và Quy ước

### Cấu trúc file

```
slices/
├── authSlice.ts         # Authentication state
├── userSlice.ts         # User management state
├── productSlice.ts      # Product catalog state
├── cartSlice.ts         # Shopping cart state
├── index.ts             # Export all slices
└── types/
    ├── AuthState.ts     # Auth state types
    └── UserState.ts     # User state types
```

### Quy ước đặt tên

- Sử dụng suffix `Slice`: `userSlice`, `authSlice`
- camelCase cho slice names
- Actions sử dụng past tense: `userLoaded`, `loginSucceeded`

## Ví dụ Implementation

### Basic Slice Structure

```typescript
// slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../domain/entities/User";
import { UserService } from "../services/UserService";

// Async Thunks
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userService = new UserService();
      return await userService.getUserById(userId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (
    { id, userData }: { id: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const userService = new UserService();
      return await userService.updateUser(id, userData);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// State Interface
interface UserState {
  currentUser: User | null;
  users: { [id: string]: User };
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Initial State
const initialState: UserState = {
  currentUser: null,
  users: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Synchronous actions
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.users[action.payload.id] = action.payload;
    },

    clearCurrentUser: (state) => {
      state.currentUser = null;
    },

    updateUserInState: (
      state,
      action: PayloadAction<{ id: string; userData: Partial<User> }>
    ) => {
      const { id, userData } = action.payload;
      if (state.users[id]) {
        state.users[id] = { ...state.users[id], ...userData };
        if (state.currentUser?.id === id) {
          state.currentUser = { ...state.currentUser, ...userData };
        }
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users[action.payload.id] = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users[action.payload.id] = action.payload;
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setCurrentUser,
  clearCurrentUser,
  updateUserInState,
  clearError,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
```

### Complex Slice với Normalization

```typescript
// slices/productSlice.ts
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { Product } from "../../domain/entities/Product";
import { ProductService } from "../services/ProductService";

// Entity Adapter for normalization
const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// Async Thunks
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (filters?: ProductFilters) => {
    const productService = new ProductService();
    return await productService.getProducts(filters);
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData: CreateProductDTO) => {
    const productService = new ProductService();
    return await productService.createProduct(productData);
  }
);

// State Interface
interface ProductState {
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  totalCount: number;
  currentPage: number;
}

// Initial State với Entity Adapter
const initialState = productsAdapter.getInitialState<ProductState>({
  loading: false,
  error: null,
  filters: {},
  totalCount: 0,
  currentPage: 1,
});

// Slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        productsAdapter.setAll(state, action.payload.products);
        state.totalCount = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })

      .addCase(addProduct.fulfilled, (state, action) => {
        productsAdapter.addOne(state, action.payload);
        state.totalCount += 1;
      });
  },
});

// Export actions
export const { setFilters, setCurrentPage, clearError } = productSlice.actions;

// Export selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectEntities: selectProductEntities,
  selectTotal: selectTotalProducts,
} = productsAdapter.getSelectors();

// Export reducer
export default productSlice.reducer;
```

### Authentication Slice

```typescript
// slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../../domain/entities/User";
import { AuthService } from "../services/AuthService";

// Async Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const authService = new AuthService();
      return await authService.login(email, password);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const authService = new AuthService();
      await authService.logout();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async () => {
    const authService = new AuthService();
    return await authService.getCurrentUser();
  }
);

// State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  lastActivity: number | null;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastActivity: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.lastActivity = null;
      })

      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.lastActivity = Date.now();
        }
      });
  },
});

// Export actions
export const { clearError, updateLastActivity, clearAuth } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
```

## Store Configuration

```typescript
// slices/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import productReducer from "./productSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Selectors

```typescript
// slices/selectors/userSelectors.ts
import { RootState } from "../index";
import { createSelector } from "@reduxjs/toolkit";

// Basic selectors
export const selectUserState = (state: RootState) => state.user;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

// Memoized selectors
export const selectUserById = createSelector(
  [selectUserState, (state: RootState, userId: string) => userId],
  (userState, userId) => userState.users[userId]
);

export const selectAllUsers = createSelector([selectUserState], (userState) =>
  Object.values(userState.users)
);

export const selectActiveUsers = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.isActive)
);
```

## Best Practices

1. **Immutability**: RTK Immer xử lý immutability tự động
2. **Normalization**: Sử dụng createEntityAdapter cho complex data
3. **Error Handling**: Luôn handle pending, fulfilled, rejected states
4. **Selectors**: Sử dụng reselect để optimize performance
5. **Async Thunks**: Xử lý async operations với proper error handling
6. **Type Safety**: Định nghĩa TypeScript interfaces cho state
7. **Separation**: Tách riêng các domain/feature vào các slice riêng biệt

## Testing

```typescript
// slices/__tests__/userSlice.test.ts
import userReducer, { fetchUser, setCurrentUser } from "../userSlice";

describe("userSlice", () => {
  const initialState = {
    currentUser: null,
    users: {},
    loading: false,
    error: null,
    lastUpdated: null,
  };

  it("should handle setCurrentUser", () => {
    const user = { id: "1", name: "Test User", email: "test@example.com" };
    const action = setCurrentUser(user);
    const state = userReducer(initialState, action);

    expect(state.currentUser).toEqual(user);
    expect(state.users["1"]).toEqual(user);
  });

  it("should handle fetchUser.pending", () => {
    const action = { type: fetchUser.pending.type };
    const state = userReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });
});
```

## Lưu ý

- Slices chỉ nên gọi services từ application layer, không trực tiếp gọi repositories
- Sử dụng async thunks cho tất cả async operations
- Normalize data khi có relationships phức tạp
- Implement proper loading và error states
- Sử dụng selectors để access state từ components
