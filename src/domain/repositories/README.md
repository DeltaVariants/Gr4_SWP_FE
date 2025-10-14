# Domain Repositories

Thư mục này chứa các Repository interfaces - contracts định nghĩa cách thức persist và retrieve domain entities.

## Mục đích

Domain Repositories định nghĩa:

- Contracts cho data persistence
- Abstract interfaces không phụ thuộc vào implementation details
- Query methods cho domain objects
- Business-focused data access patterns
- Aggregate boundary enforcement

## Cấu trúc và Quy ước

### Cấu trúc file

```
repositories/
├── IUserRepository.ts          # User repository interface
├── IProductRepository.ts       # Product repository interface
├── IOrderRepository.ts         # Order repository interface
├── ICategoryRepository.ts      # Category repository interface
├── base/
│   ├── IRepository.ts          # Base repository interface
│   └── IUnitOfWork.ts          # Unit of work pattern
├── specifications/
│   ├── UserSpecification.ts    # User query specifications
│   └── ProductSpecification.ts # Product query specifications
└── types/
    ├── QueryOptions.ts         # Query options and filters
    └── RepositoryTypes.ts      # Common repository types
```

### Quy ước đặt tên

- Sử dụng prefix `I` cho interfaces: `IUserRepository`
- Repository theo domain entity: `User` -> `IUserRepository`
- Methods mô tả business intent: `findActiveUsers()`, `getOrdersByCustomer()`

## Ví dụ Implementation

### Base Repository Interface

```typescript
// repositories/base/IRepository.ts
export interface IRepository<TEntity, TId> {
  // Basic CRUD operations
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
  exists(id: TId): Promise<boolean>;

  // Bulk operations
  saveMany(entities: TEntity[]): Promise<TEntity[]>;
  deleteMany(ids: TId[]): Promise<void>;

  // Counting
  count(): Promise<number>;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### User Repository Interface

```typescript
// repositories/IUserRepository.ts
import {
  IRepository,
  IPaginationOptions,
  IPaginatedResult,
} from "./base/IRepository";
import { User } from "../entities/User";
import { UserRole } from "../entities/enums/UserRole";

export interface IUserRepository extends IRepository<User, string> {
  // Find methods
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findInactiveUsers(): Promise<User[]>;
  findVerifiedUsers(): Promise<User[]>;
  findUnverifiedUsers(): Promise<User[]>;

  // Search and filtering
  searchByName(
    name: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>>;
  findByRoleWithPagination(
    role: UserRole,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>>;
  findUsersCreatedBetween(startDate: Date, endDate: Date): Promise<User[]>;
  findUsersLastLogin(days: number): Promise<User[]>;

  // Business-specific queries
  findAdministrators(): Promise<User[]>;
  findCustomersByRegistrationDate(date: Date): Promise<User[]>;
  findUsersWithoutOrders(): Promise<User[]>;
  findTopCustomersByOrderValue(limit: number): Promise<User[]>;

  // Update specific fields
  updateLastLogin(userId: string, loginTime: Date): Promise<void>;
  updateEmailVerificationStatus(
    userId: string,
    verified: boolean
  ): Promise<void>;
  updateUserStatus(userId: string, isActive: boolean): Promise<void>;

  // Statistics and analytics
  countByRole(role: UserRole): Promise<number>;
  countActiveUsers(): Promise<number>;
  countNewUsersInPeriod(startDate: Date, endDate: Date): Promise<number>;
  getUserRegistrationStats(
    period: "daily" | "weekly" | "monthly"
  ): Promise<RegistrationStats[]>;

  // Validation helpers
  isEmailUnique(email: string, excludeUserId?: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}

export interface RegistrationStats {
  period: string;
  count: number;
  date: Date;
}
```

### Product Repository Interface

```typescript
// repositories/IProductRepository.ts
import {
  IRepository,
  IPaginationOptions,
  IPaginatedResult,
} from "./base/IRepository";
import { Product } from "../entities/Product";
import { Money } from "../entities/values/Money";

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  searchTerm?: string;
}

export interface IProductRepository extends IRepository<Product, string> {
  // Find methods
  findByCategory(categoryId: string): Promise<Product[]>;
  findBySku(sku: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findFeaturedProducts(limit?: number): Promise<Product[]>;
  findRelatedProducts(productId: string, limit?: number): Promise<Product[]>;

  // Search and filtering
  findWithFilters(
    filters: ProductFilter,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<Product>>;
  searchProducts(
    query: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<Product>>;
  findProductsByPriceRange(
    minPrice: Money,
    maxPrice: Money
  ): Promise<Product[]>;
  findProductsByTags(tags: string[]): Promise<Product[]>;

  // Inventory management
  findLowStockProducts(threshold: number): Promise<Product[]>;
  findOutOfStockProducts(): Promise<Product[]>;
  updateStock(productId: string, quantity: number): Promise<void>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseStock(productId: string, quantity: number): Promise<void>;

  // Business queries
  findBestSellingProducts(limit: number, period?: Date): Promise<Product[]>;
  findMostViewedProducts(limit: number): Promise<Product[]>;
  findProductsNeedingRestock(): Promise<Product[]>;
  findDiscountedProducts(): Promise<Product[]>;

  // Analytics
  getProductSalesStats(
    productId: string,
    period: "daily" | "weekly" | "monthly"
  ): Promise<SalesStats[]>;
  getInventoryValue(): Promise<Money>;
  getCategoryProductCounts(): Promise<CategoryProductCount[]>;

  // Validation
  isSkuUnique(sku: string, excludeProductId?: string): Promise<boolean>;
  isSlugUnique(slug: string, excludeProductId?: string): Promise<boolean>;
}

export interface SalesStats {
  date: Date;
  quantity: number;
  revenue: number;
}

export interface CategoryProductCount {
  categoryId: string;
  categoryName: string;
  productCount: number;
}
```

### Order Repository Interface

```typescript
// repositories/IOrderRepository.ts
import {
  IRepository,
  IPaginationOptions,
  IPaginatedResult,
} from "./base/IRepository";
import { Order } from "../entities/Order";
import { OrderStatus } from "../entities/enums/OrderStatus";
import { Money } from "../entities/values/Money";

export interface OrderFilter {
  customerId?: string;
  status?: OrderStatus;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  productId?: string;
}

export interface IOrderRepository extends IRepository<Order, string> {
  // Find methods
  findByCustomer(customerId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findRecentOrders(limit: number): Promise<Order[]>;

  // Customer-specific queries
  findCustomerOrders(
    customerId: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<Order>>;
  findCustomerOrderHistory(
    customerId: string,
    limit?: number
  ): Promise<Order[]>;
  getCustomerOrderStats(customerId: string): Promise<CustomerOrderStats>;

  // Status-based queries
  findPendingOrders(): Promise<Order[]>;
  findProcessingOrders(): Promise<Order[]>;
  findCompletedOrders(dateFrom?: Date, dateTo?: Date): Promise<Order[]>;
  findCancelledOrders(): Promise<Order[]>;

  // Business queries
  findOrdersRequiringShipping(): Promise<Order[]>;
  findOrdersWithProduct(productId: string): Promise<Order[]>;
  findHighValueOrders(minAmount: Money): Promise<Order[]>;
  findOrdersCreatedToday(): Promise<Order[]>;

  // Search and filtering
  findWithFilters(
    filters: OrderFilter,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<Order>>;
  searchOrders(
    query: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<Order>>;

  // Analytics and reporting
  getTotalRevenue(dateFrom?: Date, dateTo?: Date): Promise<Money>;
  getOrderCountByStatus(): Promise<OrderStatusCount[]>;
  getDailySalesReport(
    dateFrom: Date,
    dateTo: Date
  ): Promise<DailySalesReport[]>;
  getTopSellingProducts(
    limit: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ProductSalesReport[]>;
  getCustomerOrderFrequency(): Promise<CustomerOrderFrequency[]>;

  // Status updates
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  markAsShipped(orderId: string, trackingNumber: string): Promise<void>;
  markAsDelivered(orderId: string, deliveryDate: Date): Promise<void>;

  // Validation
  existsByOrderNumber(orderNumber: string): Promise<boolean>;
  hasCustomerPlacedOrder(
    customerId: string,
    productId: string
  ): Promise<boolean>;
}

export interface CustomerOrderStats {
  totalOrders: number;
  totalSpent: Money;
  averageOrderValue: Money;
  lastOrderDate?: Date;
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface DailySalesReport {
  date: Date;
  orderCount: number;
  revenue: Money;
  averageOrderValue: Money;
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: Money;
}

export interface CustomerOrderFrequency {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalSpent: Money;
  averageDaysBetweenOrders: number;
}
```

### Specification Pattern

```typescript
// repositories/specifications/UserSpecification.ts
export abstract class Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

export class ActiveUserSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive;
  }
}

export class VerifiedUserSpecification extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.emailVerified;
  }
}

export class UserRoleSpecification extends Specification<User> {
  constructor(private role: UserRole) {
    super();
  }

  isSatisfiedBy(user: User): boolean {
    return user.role === this.role;
  }
}

// Usage with repository
export interface IUserRepository extends IRepository<User, string> {
  findBySpecification(
    spec: Specification<User>,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>>;
}
```

### Unit of Work Interface

```typescript
// repositories/base/IUnitOfWork.ts
export interface IUnitOfWork {
  // Repository access
  userRepository: IUserRepository;
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;

  // Transaction management
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;

  // Execution within transaction
  executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;

  // Change tracking
  markAsNew<T>(entity: T): void;
  markAsModified<T>(entity: T): void;
  markAsDeleted<T>(entity: T): void;

  // Persistence
  saveChanges(): Promise<void>;

  // Cleanup
  dispose(): void;
}
```

### Query Options

```typescript
// repositories/types/QueryOptions.ts
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterOption {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "contains"
    | "startsWith"
    | "endsWith";
  value: any;
}

export interface QueryOptions {
  pagination?: IPaginationOptions;
  sorting?: SortOption[];
  filters?: FilterOption[];
  includes?: string[]; // Related entities to include
  select?: string[]; // Fields to select
}

export interface RepositoryQuery<T> {
  where(predicate: (entity: T) => boolean): RepositoryQuery<T>;
  orderBy<K extends keyof T>(
    keySelector: K,
    direction?: "asc" | "desc"
  ): RepositoryQuery<T>;
  include(navigationProperty: string): RepositoryQuery<T>;
  select<K extends keyof T>(selector: K[]): RepositoryQuery<Partial<T>>;
  skip(count: number): RepositoryQuery<T>;
  take(count: number): RepositoryQuery<T>;

  // Execution methods
  toList(): Promise<T[]>;
  first(): Promise<T>;
  firstOrDefault(): Promise<T | null>;
  single(): Promise<T>;
  singleOrDefault(): Promise<T | null>;
  count(): Promise<number>;
  any(): Promise<boolean>;
}
```

## Repository Factory

```typescript
// repositories/IRepositoryFactory.ts
export interface IRepositoryFactory {
  createUserRepository(): IUserRepository;
  createProductRepository(): IProductRepository;
  createOrderRepository(): IOrderRepository;
  createUnitOfWork(): IUnitOfWork;
}
```

## Best Practices

1. **Interface Segregation**: Keep interfaces focused và không quá lớn
2. **Business Language**: Sử dụng business terms trong method names
3. **Query Objects**: Sử dụng query objects cho complex queries
4. **Specification Pattern**: Implement specification pattern cho reusable business rules
5. **Unit of Work**: Sử dụng Unit of Work pattern cho transactions
6. **Pagination**: Always provide pagination options cho large datasets
7. **Async/Await**: All repository methods should be async

## Testing Repository Interfaces

```typescript
// repositories/__tests__/IUserRepository.test.ts
// Test với mock implementation
export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  // Implement other methods...
}

describe("User Repository Contract", () => {
  let repository: IUserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
  });

  it("should find user by email", async () => {
    const user = User.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hash",
      role: UserRole.USER,
      isActive: true,
      emailVerified: false,
    });

    await repository.save(user);
    const found = await repository.findByEmail("john@example.com");

    expect(found).toBeDefined();
    expect(found?.email).toBe("john@example.com");
  });
});
```

## Common Repository Patterns

```typescript
// repositories/patterns/RepositoryPatterns.ts
export abstract class BaseRepository<TEntity, TId>
  implements IRepository<TEntity, TId>
{
  protected abstract getEntityName(): string;

  abstract findById(id: TId): Promise<TEntity | null>;
  abstract findAll(): Promise<TEntity[]>;
  abstract save(entity: TEntity): Promise<TEntity>;
  abstract update(entity: TEntity): Promise<TEntity>;
  abstract delete(id: TId): Promise<void>;

  async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(): Promise<number> {
    const entities = await this.findAll();
    return entities.length;
  }

  protected logOperation(operation: string, entityId?: TId): void {
    console.log(
      `${operation} on ${this.getEntityName()}${
        entityId ? ` with ID: ${entityId}` : ""
      }`
    );
  }
}
```

## Lưu ý

- Repository interfaces thuộc về domain layer, implementation thuộc infrastructure layer
- Methods nên reflect business operations, không chỉ CRUD
- Sử dụng domain-specific return types (entities, value objects)
- Provide both individual và bulk operations
- Consider caching strategies trong interface design
- Always return domain entities, không phải DTOs
- Repository chỉ nên handle một aggregate root
