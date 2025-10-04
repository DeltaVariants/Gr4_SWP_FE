# Application Services

Thư mục này chứa các Application Services - lớp chứa business logic và điều phối các use cases trong Clean Architecture.

## Mục đích

Application Services hoạt động như một façade pattern, điều phối giữa presentation layer và domain layer. Chúng chứa:

- Business logic phức tạp
- Điều phối nhiều use cases
- Transaction management
- Authorization logic
- Data transformation

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
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { CreateUserDTO, UpdateUserDTO } from "../../domain/dto/UserDTO";
import { ValidationError, NotFoundError } from "../../domain/errors";

export interface IUserService {
  createUser(userData: CreateUserDTO): Promise<User>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, userData: UpdateUserDTO): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class UserService implements IUserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: CreateUserDTO): Promise<User> {
    // Validation logic
    this.validateUserData(userData);

    // Business rules
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    // Create user
    const user = new User({
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
    });

    // Save to repository
    return await this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError("User ID is required");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    const existingUser = await this.getUserById(id);

    // Business rules for update
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new ValidationError("Email already in use");
      }
    }

    const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
    return await this.userRepository.update(id, updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    await this.getUserById(id); // Verify user exists
    await this.userRepository.delete(id);
  }

  private validateUserData(userData: CreateUserDTO): void {
    if (!userData.email || !userData.name) {
      throw new ValidationError("Email and name are required");
    }

    if (!this.isValidEmail(userData.email)) {
      throw new ValidationError("Invalid email format");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
```

### Service với Multiple Dependencies

```typescript
import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { PaymentService } from "./PaymentService";
import { EmailService } from "./EmailService";

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private paymentService: PaymentService,
    private emailService: EmailService
  ) {}

  async processOrder(orderData: CreateOrderDTO): Promise<Order> {
    // 1. Validate products availability
    await this.validateProductsAvailability(orderData.items);

    // 2. Calculate total amount
    const totalAmount = await this.calculateTotalAmount(orderData.items);

    // 3. Process payment
    const paymentResult = await this.paymentService.processPayment({
      amount: totalAmount,
      currency: orderData.currency,
      paymentMethod: orderData.paymentMethod,
    });

    // 4. Create order
    const order = new Order({
      ...orderData,
      totalAmount,
      paymentId: paymentResult.id,
      status: "confirmed",
    });

    // 5. Save order
    const savedOrder = await this.orderRepository.save(order);

    // 6. Update product inventory
    await this.updateProductInventory(orderData.items);

    // 7. Send confirmation email
    await this.emailService.sendOrderConfirmation(savedOrder);

    return savedOrder;
  }

  private async validateProductsAvailability(
    items: OrderItem[]
  ): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new ValidationError(`Product ${item.productId} is not available`);
      }
    }
  }
}
```

## Dependency Injection

### Service Container/Factory

```typescript
// services/ServiceContainer.ts
import { UserRepository } from "../../domain/repositories/UserRepository";
import { ApiUserRepository } from "../../infrastructure/repositories/ApiUserRepository";

export class ServiceContainer {
  private static instance: ServiceContainer;

  private userRepository: UserRepository;

  private constructor() {
    this.userRepository = new ApiUserRepository();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  getUserService(): UserService {
    return new UserService(this.userRepository);
  }
}
```

## Best Practices

1. **Single Responsibility**: Một service chỉ quản lý một domain/aggregate
2. **Dependency Injection**: Inject dependencies thông qua constructor
3. **Interface Segregation**: Định nghĩa interface cho mỗi service
4. **Error Handling**: Xử lý và throw domain-specific errors
5. **Transaction Management**: Quản lý transactions cho complex operations
6. **Validation**: Validate input data và business rules
7. **Logging**: Log important operations và errors

## Testing

```typescript
// services/__tests__/UserService.test.ts
import { UserService } from "../UserService";
import { MockUserRepository } from "../../infrastructure/repositories/__mocks__/MockUserRepository";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: MockUserRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it("should throw error when email already exists", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(new User({ id: "1" }));

      await expect(
        userService.createUser({
          email: "existing@example.com",
          name: "Test",
        })
      ).rejects.toThrow("Email already exists");
    });
  });
});
```

## Lưu ý

- Services không được import trực tiếp từ infrastructure layer
- Sử dụng dependency injection để inject repositories
- Business logic thuộc về services, không thuộc về entities
- Services có thể gọi các services khác thông qua dependency injection
- Luôn validate input và handle errors appropriately
