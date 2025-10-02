# Application Use Cases

Thư mục này chứa các Use Cases - đại diện cho các business operations cụ thể trong Clean Architecture.

## Mục đích

Use Cases định nghĩa:

- Các business operations/workflows cụ thể
- Input và output boundaries
- Business rules validation
- Orchestration logic
- Error handling cho specific operations

## Cấu trúc và Quy ước

### Cấu trúc file

```
usecases/
├── auth/
│   ├── LoginUseCase.ts          # User login workflow
│   ├── RegisterUseCase.ts       # User registration
│   └── LogoutUseCase.ts         # User logout
├── user/
│   ├── CreateUserUseCase.ts     # Create new user
│   ├── GetUserUseCase.ts        # Retrieve user details
│   ├── UpdateUserUseCase.ts     # Update user information
│   └── DeleteUserUseCase.ts     # Delete user
├── product/
│   ├── CreateProductUseCase.ts  # Add new product
│   ├── GetProductsUseCase.ts    # List products with filters
│   └── UpdateProductUseCase.ts  # Update product details
├── base/
│   └── UseCase.ts               # Base use case interface
└── types/
    ├── UseCaseRequest.ts        # Request interfaces
    └── UseCaseResponse.ts       # Response interfaces
```

### Quy ước đặt tên

- Sử dụng suffix `UseCase`: `LoginUseCase`, `CreateUserUseCase`
- Tên phản ánh action + entity: `CreateProduct`, `GetUser`
- Interface: `ILoginUseCase`, `ICreateUserUseCase`

## Ví dụ Implementation

### Base Use Case Interface

```typescript
// usecases/base/UseCase.ts
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export abstract class BaseUseCase<TRequest, TResponse>
  implements UseCase<TRequest, TResponse>
{
  abstract execute(request: TRequest): Promise<TResponse>;

  protected validateRequest(request: TRequest): void {
    if (!request) {
      throw new Error("Request cannot be null or undefined");
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}
```

### Simple Use Case

```typescript
// usecases/user/GetUserUseCase.ts
import { BaseUseCase } from "../base/UseCase";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { NotFoundError, ValidationError } from "../../domain/errors";

// Request/Response Types
export interface GetUserRequest {
  userId: string;
}

export interface GetUserResponse {
  user: User;
}

// Use Case Implementation
export class GetUserUseCase extends BaseUseCase<
  GetUserRequest,
  GetUserResponse
> {
  constructor(private userRepository: UserRepository) {
    super();
  }

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    this.validateRequest(request);
    this.validateUserId(request.userId);

    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        throw new NotFoundError(`User with ID ${request.userId} not found`);
      }

      return { user };
    } catch (error) {
      this.handleError(error);
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim() === "") {
      throw new ValidationError("User ID is required and cannot be empty");
    }
  }
}
```

### Complex Use Case với Multiple Dependencies

```typescript
// usecases/auth/LoginUseCase.ts
import { BaseUseCase } from "../base/UseCase";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { PasswordService } from "../../domain/services/PasswordService";
import { TokenService } from "../../domain/services/TokenService";
import { AuthenticationError, ValidationError } from "../../domain/errors";

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Use Case Implementation
export class LoginUseCase extends BaseUseCase<LoginRequest, LoginResponse> {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService
  ) {
    super();
  }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    this.validateRequest(request);
    this.validateLoginCredentials(request);

    try {
      // 1. Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // 2. Verify password
      const isPasswordValid = await this.passwordService.verify(
        request.password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // 3. Check if user account is active
      if (!user.isActive) {
        throw new AuthenticationError("Account is deactivated");
      }

      // 4. Update last login timestamp
      await this.userRepository.updateLastLogin(user.id);

      // 5. Generate tokens
      const tokenExpiry = request.rememberMe ? "30d" : "1d";
      const accessToken = await this.tokenService.generateAccessToken(
        user,
        tokenExpiry
      );
      const refreshToken = await this.tokenService.generateRefreshToken(user);

      // 6. Calculate expiration time
      const expiresIn = request.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // seconds

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private validateLoginCredentials(request: LoginRequest): void {
    if (!request.email || !request.password) {
      throw new ValidationError("Email and password are required");
    }

    if (!this.isValidEmail(request.email)) {
      throw new ValidationError("Invalid email format");
    }

    if (request.password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private sanitizeUser(user: User): User {
    // Remove sensitive information before returning
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }
}
```

### Use Case với Transaction Management

```typescript
// usecases/order/ProcessOrderUseCase.ts
import { BaseUseCase } from "../base/UseCase";
import { Order } from "../../domain/entities/Order";
import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import { EmailService } from "../../domain/services/EmailService";
import { TransactionManager } from "../../infrastructure/database/TransactionManager";

export interface ProcessOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

export interface ProcessOrderResponse {
  order: Order;
  paymentId: string;
}

export class ProcessOrderUseCase extends BaseUseCase<
  ProcessOrderRequest,
  ProcessOrderResponse
> {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private paymentRepository: PaymentRepository,
    private emailService: EmailService,
    private transactionManager: TransactionManager
  ) {
    super();
  }

  async execute(request: ProcessOrderRequest): Promise<ProcessOrderResponse> {
    this.validateRequest(request);
    this.validateOrderItems(request.items);

    return await this.transactionManager.runInTransaction(async () => {
      try {
        // 1. Validate product availability and reserve inventory
        await this.validateAndReserveProducts(request.items);

        // 2. Calculate order total
        const totalAmount = await this.calculateOrderTotal(request.items);

        // 3. Create order entity
        const order = new Order({
          userId: request.userId,
          items: request.items,
          totalAmount,
          shippingAddress: request.shippingAddress,
          status: "pending",
          createdAt: new Date(),
        });

        // 4. Save order
        const savedOrder = await this.orderRepository.save(order);

        // 5. Process payment
        const payment = await this.paymentRepository.processPayment({
          orderId: savedOrder.id,
          amount: totalAmount,
          paymentMethod: request.paymentMethod,
        });

        // 6. Update order status
        savedOrder.paymentId = payment.id;
        savedOrder.status = "confirmed";
        await this.orderRepository.update(savedOrder);

        // 7. Send confirmation email (async, outside transaction)
        setImmediate(() => {
          this.emailService
            .sendOrderConfirmation(savedOrder)
            .catch(console.error);
        });

        return {
          order: savedOrder,
          paymentId: payment.id,
        };
      } catch (error) {
        // Transaction will be rolled back automatically
        this.handleError(error);
      }
    });
  }

  private async validateAndReserveProducts(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for product ${product.name}`
        );
      }

      // Reserve inventory
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }
  }

  private async calculateOrderTotal(items: OrderItem[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }

  private validateOrderItems(items: OrderItem[]): void {
    if (!items || items.length === 0) {
      throw new ValidationError("Order must contain at least one item");
    }

    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        throw new ValidationError("Invalid order item");
      }
    }
  }
}
```

## Use Case Factory/Container

```typescript
// usecases/UseCaseFactory.ts
import { UserRepository } from "../domain/repositories/UserRepository";
import { ApiUserRepository } from "../infrastructure/repositories/ApiUserRepository";
import { GetUserUseCase } from "./user/GetUserUseCase";
import { LoginUseCase } from "./auth/LoginUseCase";

export class UseCaseFactory {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new ApiUserRepository();
  }

  createGetUserUseCase(): GetUserUseCase {
    return new GetUserUseCase(this.userRepository);
  }

  createLoginUseCase(): LoginUseCase {
    return new LoginUseCase(
      this.userRepository,
      new PasswordService(),
      new TokenService()
    );
  }
}
```

## Integration với Services

```typescript
// application/services/UserService.ts
import { GetUserUseCase } from "../usecases/user/GetUserUseCase";
import { CreateUserUseCase } from "../usecases/user/CreateUserUseCase";

export class UserService {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private createUserUseCase: CreateUserUseCase
  ) {}

  async getUserById(userId: string): Promise<User> {
    const response = await this.getUserUseCase.execute({ userId });
    return response.user;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.createUserUseCase.execute(userData);
    return response.user;
  }
}
```

## Best Practices

1. **Single Responsibility**: Mỗi use case chỉ handle một business operation
2. **Input Validation**: Validate tất cả inputs trước khi xử lý
3. **Error Handling**: Proper error handling và meaningful error messages
4. **Transaction Management**: Sử dụng transactions cho complex operations
5. **Dependency Injection**: Inject dependencies thông qua constructor
6. **Immutability**: Không modify input parameters
7. **Logging**: Log important operations và errors

## Testing

```typescript
// usecases/__tests__/GetUserUseCase.test.ts
import { GetUserUseCase } from "../user/GetUserUseCase";
import { MockUserRepository } from "../../infrastructure/repositories/__mocks__/MockUserRepository";
import { NotFoundError, ValidationError } from "../../domain/errors";

describe("GetUserUseCase", () => {
  let getUserUseCase: GetUserUseCase;
  let mockUserRepository: MockUserRepository;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    getUserUseCase = new GetUserUseCase(mockUserRepository);
  });

  it("should return user when found", async () => {
    const user = new User({ id: "1", name: "Test User" });
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await getUserUseCase.execute({ userId: "1" });

    expect(result.user).toEqual(user);
    expect(mockUserRepository.findById).toHaveBeenCalledWith("1");
  });

  it("should throw NotFoundError when user not found", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(getUserUseCase.execute({ userId: "1" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("should throw ValidationError for empty userId", async () => {
    await expect(getUserUseCase.execute({ userId: "" })).rejects.toThrow(
      ValidationError
    );
  });
});
```

## Lưu ý

- Use cases chỉ nên depend vào domain layer (entities, repositories, domain services)
- Không được import từ infrastructure hoặc presentation layers
- Mỗi use case handle một specific business scenario
- Sử dụng dependency injection để inject repositories và services
- Error handling phải consistent và meaningful
- Use cases có thể được compose từ các use cases khác nếu cần thiết
