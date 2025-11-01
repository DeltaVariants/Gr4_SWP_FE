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

## Lưu ý

- Slices chỉ nên gọi services từ application layer, không trực tiếp gọi repositories
- Sử dụng async thunks cho tất cả async operations
- Normalize data khi có relationships phức tạp
- Implement proper loading và error states
- Sử dụng selectors để access state từ components
```
