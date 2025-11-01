# Application Services

Thư mục này chứa các Application Services - lớp chứa business logic và điều phối các use cases trong Clean Architecture.

## Mục đích

Chứa các async thunks để gọi API và xử lý business logic phức tạp không thuộc về domain entities hoặc repositories:

- Điều phối các thao tác giữa nhiều repositories
- Thực hiện các quy tắc nghiệp vụ (business rules)

## Cấu trúc và Quy ước

### Cấu trúc file

```
services/
├── AuthService.ts           # Authentication & Authorization
├── UserService.ts           # User management operations
├── ProductService.ts        # Product business logic
├── OrderService.ts          # Order processing
└── base/
    └── BaseService.ts       # Common service functionality
```

### Quy ước đặt tên

- Sử dụng suffix `Service`: `UserService`, `ProductService`
- PascalCase cho class names
- Interface tương ứng: `IUserService`

## Ví dụ Implementation

### Basic Service Structure

```typescript

```

## Lưu ý

- Services không được import trực tiếp từ infrastructure layer
- Sử dụng dependency injection để inject repositories
- Business logic thuộc về services, không thuộc về entities
- Services có thể gọi các services khác thông qua dependency injection
- Luôn validate input và handle errors appropriately
