# Infrastructure Repositories

Thư mục này chứa concrete implementations của domain repository interfaces sử dụng external data sources.

## Mục đích

Infrastructure Repositories implement:

- Domain repository interfaces
- Data persistence logic
- External API integration
- Database operations
- Caching strategies
- Data mapping và transformation

## Cấu trúc và Quy ước

### Cấu trúc file

```
repositories/
├── implementations/
│   ├── ApiUserRepository.ts        # HTTP API implementation
│   ├── ApiProductRepository.ts     # Product API repository
│   ├── ApiOrderRepository.ts       # Order API repository
│   └── LocalStorageRepository.ts   # Local storage implementation
├── cache/
│   ├── CachedUserRepository.ts     # Cached repository decorator
│   ├── CacheManager.ts             # Cache management utility
│   └── CacheConfig.ts              # Cache configuration
├── mappers/
│   ├── UserMapper.ts               # User entity/DTO mapping
│   ├── ProductMapper.ts            # Product entity/DTO mapping
│   └── BaseMapper.ts               # Base mapping utilities
├── database/
│   ├── IndexedDBRepository.ts      # IndexedDB implementation
│   ├── DatabaseManager.ts          # Database connection manager
│   └── MigrationManager.ts         # Database migrations
└── mock/
    ├── MockUserRepository.ts       # Mock implementation for testing
    ├── MockProductRepository.ts    # Mock product repository
    └── TestDataFactory.ts          # Test data generation
```

### Quy ước đặt tên

- API implementations: `ApiUserRepository`, `ApiProductRepository`
- Cache decorators: `CachedUserRepository`
- Mock implementations: `MockUserRepository`
- Mappers: `UserMapper`, `ProductMapper`

## Ví dụ Implementation

### Base Repository Implementation

```typescript
// repositories/base/BaseApiRepository.ts
import { HttpClient, HttpResponse } from "../../api/clients/HttpClient";
import {
  IRepository,
  IPaginationOptions,
  IPaginatedResult,
} from "../../../domain/repositories/base/IRepository";

export abstract class BaseApiRepository<TEntity, TDto, TId>
  implements IRepository<TEntity, TId>
{
  protected httpClient: HttpClient;
  protected baseEndpoint: string;

  constructor(httpClient: HttpClient, baseEndpoint: string) {
    this.httpClient = httpClient;
    this.baseEndpoint = baseEndpoint;
  }

  // Abstract methods for mapping
  protected abstract mapDtoToEntity(dto: TDto): TEntity;
  protected abstract mapEntityToDto(entity: TEntity): Partial<TDto>;
  protected abstract getEntityId(entity: TEntity): TId;

  async findById(id: TId): Promise<TEntity | null> {
    try {
      const response = await this.httpClient.get<TDto>(
        `${this.baseEndpoint}/${id}`
      );
      return this.mapDtoToEntity(response.data);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw this.handleError(error, "findById");
    }
  }

  async findAll(): Promise<TEntity[]> {
    try {
      const response = await this.httpClient.get<TDto[]>(this.baseEndpoint);
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findAll");
    }
  }

  async save(entity: TEntity): Promise<TEntity> {
    try {
      const dto = this.mapEntityToDto(entity);
      const response = await this.httpClient.post<TDto>(this.baseEndpoint, dto);
      return this.mapDtoToEntity(response.data);
    } catch (error: any) {
      throw this.handleError(error, "save");
    }
  }

  async update(entity: TEntity): Promise<TEntity> {
    try {
      const id = this.getEntityId(entity);
      const dto = this.mapEntityToDto(entity);
      const response = await this.httpClient.put<TDto>(
        `${this.baseEndpoint}/${id}`,
        dto
      );
      return this.mapDtoToEntity(response.data);
    } catch (error: any) {
      throw this.handleError(error, "update");
    }
  }

  async delete(id: TId): Promise<void> {
    try {
      await this.httpClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error: any) {
      throw this.handleError(error, "delete");
    }
  }

  async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async saveMany(entities: TEntity[]): Promise<TEntity[]> {
    const results: TEntity[] = [];
    for (const entity of entities) {
      results.push(await this.save(entity));
    }
    return results;
  }

  async deleteMany(ids: TId[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async count(): Promise<number> {
    try {
      const response = await this.httpClient.get<{ count: number }>(
        `${this.baseEndpoint}/count`
      );
      return response.data.count;
    } catch (error: any) {
      // Fallback to getting all and counting
      const all = await this.findAll();
      return all.length;
    }
  }

  protected async findWithPagination<TResponse>(
    endpoint: string,
    options?: IPaginationOptions,
    params?: Record<string, any>
  ): Promise<IPaginatedResult<TEntity>> {
    try {
      const queryParams = {
        ...params,
        ...(options && {
          page: options.page,
          limit: options.limit,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        }),
      };

      const response = await this.httpClient.get<{
        data: TDto[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(endpoint, queryParams);

      return {
        data: response.data.data.map((dto) => this.mapDtoToEntity(dto)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
      };
    } catch (error: any) {
      throw this.handleError(error, "findWithPagination");
    }
  }

  protected handleError(error: any, operation: string): Error {
    const message = error.message || `Failed to ${operation}`;
    const repositoryError = new Error(
      `Repository Error (${operation}): ${message}`
    );

    // Add additional error context
    (repositoryError as any).originalError = error;
    (repositoryError as any).operation = operation;
    (repositoryError as any).status = error.status;

    return repositoryError;
  }
}
```

### User Repository Implementation

```typescript
// repositories/implementations/ApiUserRepository.ts
import {
  IUserRepository,
  RegistrationStats,
} from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/enums/UserRole";
import { BaseApiRepository } from "../base/BaseApiRepository";
import { UserMapper } from "../mappers/UserMapper";
import { UserResponseDTO } from "../../../domain/dto/user/UserResponseDTO";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../../domain/repositories/base/IRepository";

export class ApiUserRepository
  extends BaseApiRepository<User, UserResponseDTO, string>
  implements IUserRepository
{
  private userMapper: UserMapper;

  constructor(httpClient: HttpClient) {
    super(httpClient, "/users");
    this.userMapper = new UserMapper();
  }

  protected mapDtoToEntity(dto: UserResponseDTO): User {
    return this.userMapper.toEntity(dto);
  }

  protected mapEntityToDto(entity: User): Partial<UserResponseDTO> {
    return this.userMapper.toDto(entity);
  }

  protected getEntityId(entity: User): string {
    return entity.id;
  }

  // Domain-specific methods
  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get<UserResponseDTO>(
        "/users/by-email",
        { email }
      );
      return this.mapDtoToEntity(response.data);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw this.handleError(error, "findByEmail");
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/by-role",
        { role }
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findByRole");
    }
  }

  async findActiveUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/active"
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findActiveUsers");
    }
  }

  async findInactiveUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/inactive"
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findInactiveUsers");
    }
  }

  async findVerifiedUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/verified"
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findVerifiedUsers");
    }
  }

  async findUnverifiedUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/unverified"
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findUnverifiedUsers");
    }
  }

  async searchByName(
    name: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>> {
    return this.findWithPagination("/users/search", options, { name });
  }

  async findByRoleWithPagination(
    role: UserRole,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>> {
    return this.findWithPagination("/users/by-role", options, { role });
  }

  async findUsersCreatedBetween(
    startDate: Date,
    endDate: Date
  ): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/created-between",
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findUsersCreatedBetween");
    }
  }

  async findUsersLastLogin(days: number): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/last-login",
        { days }
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findUsersLastLogin");
    }
  }

  // Business-specific queries
  async findAdministrators(): Promise<User[]> {
    return this.findByRole(UserRole.ADMIN);
  }

  async findCustomersByRegistrationDate(date: Date): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/registered-on",
        {
          date: date.toISOString(),
        }
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findCustomersByRegistrationDate");
    }
  }

  async findUsersWithoutOrders(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/without-orders"
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findUsersWithoutOrders");
    }
  }

  async findTopCustomersByOrderValue(limit: number): Promise<User[]> {
    try {
      const response = await this.httpClient.get<UserResponseDTO[]>(
        "/users/top-customers",
        { limit }
      );
      return response.data.map((dto) => this.mapDtoToEntity(dto));
    } catch (error: any) {
      throw this.handleError(error, "findTopCustomersByOrderValue");
    }
  }

  // Update specific fields
  async updateLastLogin(userId: string, loginTime: Date): Promise<void> {
    try {
      await this.httpClient.patch(`/users/${userId}/last-login`, {
        lastLoginAt: loginTime.toISOString(),
      });
    } catch (error: any) {
      throw this.handleError(error, "updateLastLogin");
    }
  }

  async updateEmailVerificationStatus(
    userId: string,
    verified: boolean
  ): Promise<void> {
    try {
      await this.httpClient.patch(`/users/${userId}/email-verification`, {
        emailVerified: verified,
      });
    } catch (error: any) {
      throw this.handleError(error, "updateEmailVerificationStatus");
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await this.httpClient.patch(`/users/${userId}/status`, {
        isActive,
      });
    } catch (error: any) {
      throw this.handleError(error, "updateUserStatus");
    }
  }

  // Statistics and analytics
  async countByRole(role: UserRole): Promise<number> {
    try {
      const response = await this.httpClient.get<{ count: number }>(
        "/users/count-by-role",
        { role }
      );
      return response.data.count;
    } catch (error: any) {
      throw this.handleError(error, "countByRole");
    }
  }

  async countActiveUsers(): Promise<number> {
    try {
      const response = await this.httpClient.get<{ count: number }>(
        "/users/active/count"
      );
      return response.data.count;
    } catch (error: any) {
      throw this.handleError(error, "countActiveUsers");
    }
  }

  async countNewUsersInPeriod(startDate: Date, endDate: Date): Promise<number> {
    try {
      const response = await this.httpClient.get<{ count: number }>(
        "/users/count-new",
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      );
      return response.data.count;
    } catch (error: any) {
      throw this.handleError(error, "countNewUsersInPeriod");
    }
  }

  async getUserRegistrationStats(
    period: "daily" | "weekly" | "monthly"
  ): Promise<RegistrationStats[]> {
    try {
      const response = await this.httpClient.get<RegistrationStats[]>(
        "/users/registration-stats",
        { period }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, "getUserRegistrationStats");
    }
  }

  // Validation helpers
  async isEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const params: any = { email };
      if (excludeUserId) {
        params.excludeUserId = excludeUserId;
      }

      const response = await this.httpClient.get<{ unique: boolean }>(
        "/users/email-unique",
        params
      );
      return response.data.unique;
    } catch (error: any) {
      throw this.handleError(error, "isEmailUnique");
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !(await this.isEmailUnique(email));
  }
}
```

### Entity/DTO Mapper

```typescript
// repositories/mappers/UserMapper.ts
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/enums/UserRole";
import { UserResponseDTO } from "../../../domain/dto/user/UserResponseDTO";
import { BaseMapper } from "./BaseMapper";

export class UserMapper extends BaseMapper<User, UserResponseDTO> {
  toEntity(dto: UserResponseDTO): User {
    return User.reconstitute({
      id: dto.id,
      name: dto.name,
      email: dto.email,
      passwordHash: "", // Password hash should not be returned from API
      role: this.mapStringToUserRole(dto.role),
      phoneNumber: dto.phoneNumber,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      isActive: dto.isActive,
      emailVerified: true, // Assume verified if returned from API
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    });
  }

  toDto(entity: User): UserResponseDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      phoneNumber: entity.phoneNumber,
      dateOfBirth: entity.dateOfBirth?.toISOString(),
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
    };
  }

  toEntityList(dtos: UserResponseDTO[]): User[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  toDtoList(entities: User[]): UserResponseDTO[] {
    return entities.map((entity) => this.toDto(entity));
  }

  private mapStringToUserRole(roleString: string): UserRole {
    switch (roleString.toLowerCase()) {
      case "admin":
        return UserRole.ADMIN;
      case "manager":
        return UserRole.MANAGER;
      case "user":
      default:
        return UserRole.USER;
    }
  }
}
```

### Base Mapper

```typescript
// repositories/mappers/BaseMapper.ts
export abstract class BaseMapper<TEntity, TDto> {
  abstract toEntity(dto: TDto): TEntity;
  abstract toDto(entity: TEntity): TDto;

  toEntityList(dtos: TDto[]): TEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  toDtoList(entities: TEntity[]): TDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  protected mapDateStringToDate(
    dateString: string | undefined
  ): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  protected mapDateToISOString(date: Date | undefined): string | undefined {
    return date?.toISOString();
  }

  protected mapBooleanWithDefault(
    value: boolean | undefined,
    defaultValue: boolean
  ): boolean {
    return value !== undefined ? value : defaultValue;
  }
}
```

### Cached Repository Decorator

```typescript
// repositories/cache/CachedUserRepository.ts
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/enums/UserRole";
import { CacheManager } from "./CacheManager";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../../domain/repositories/base/IRepository";

export class CachedUserRepository implements IUserRepository {
  private cacheManager: CacheManager;
  private baseRepository: IUserRepository;
  private cacheTtl: number;

  constructor(
    baseRepository: IUserRepository,
    cacheManager: CacheManager,
    cacheTtl: number = 300000
  ) {
    // 5 minutes default
    this.baseRepository = baseRepository;
    this.cacheManager = cacheManager;
    this.cacheTtl = cacheTtl;
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;

    // Try to get from cache first
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from base repository
    const user = await this.baseRepository.findById(id);

    // Cache the result
    if (user) {
      await this.cacheManager.set(cacheKey, user, this.cacheTtl);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;

    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.baseRepository.findByEmail(email);

    if (user) {
      await this.cacheManager.set(cacheKey, user, this.cacheTtl);
      // Also cache by ID
      await this.cacheManager.set(`user:${user.id}`, user, this.cacheTtl);
    }

    return user;
  }

  async save(entity: User): Promise<User> {
    const result = await this.baseRepository.save(entity);

    // Invalidate cache
    await this.invalidateUserCache(result.id, result.email);

    return result;
  }

  async update(entity: User): Promise<User> {
    const result = await this.baseRepository.update(entity);

    // Invalidate cache
    await this.invalidateUserCache(result.id, result.email);

    return result;
  }

  async delete(id: string): Promise<void> {
    // Get user first to get email for cache invalidation
    const user = await this.findById(id);

    await this.baseRepository.delete(id);

    // Invalidate cache
    if (user) {
      await this.invalidateUserCache(id, user.email);
    }
  }

  // For operations that don't benefit from caching, delegate to base repository
  async findAll(): Promise<User[]> {
    return this.baseRepository.findAll();
  }

  async exists(id: string): Promise<boolean> {
    // Check cache first, then delegate
    const user = await this.findById(id);
    return user !== null;
  }

  async searchByName(
    name: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>> {
    // Search operations typically shouldn't be cached due to complexity
    return this.baseRepository.searchByName(name, options);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const cacheKey = `users:role:${role}`;

    const cached = await this.cacheManager.get<User[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const users = await this.baseRepository.findByRole(role);
    await this.cacheManager.set(cacheKey, users, this.cacheTtl);

    return users;
  }

  // Implement other methods by delegating to base repository...
  // (For brevity, showing pattern for key methods)

  private async invalidateUserCache(
    userId: string,
    email: string
  ): Promise<void> {
    await this.cacheManager.delete(`user:${userId}`);
    await this.cacheManager.delete(`user:email:${email}`);

    // Invalidate related caches
    await this.cacheManager.deletePattern("users:*");
  }

  // Delegate remaining methods to base repository
  async saveMany(entities: User[]): Promise<User[]> {
    return this.baseRepository.saveMany(entities);
  }

  async deleteMany(ids: string[]): Promise<void> {
    return this.baseRepository.deleteMany(ids);
  }

  async count(): Promise<number> {
    return this.baseRepository.count();
  }

  // ... implement remaining interface methods by delegation
}
```

### Mock Repository for Testing

```typescript
// repositories/mock/MockUserRepository.ts
import {
  IUserRepository,
  RegistrationStats,
} from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/enums/UserRole";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "../../../domain/repositories/base/IRepository";

export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private nextId = 1;

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((user) => this.users.set(user.id, user));
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(entity: User): Promise<User> {
    if (!entity.id) {
      (entity as any).id = `mock_${this.nextId++}`;
    }
    this.users.set(entity.id, entity);
    return entity;
  }

  async update(entity: User): Promise<User> {
    this.users.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  async searchByName(
    name: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>> {
    const filtered = Array.from(this.users.values()).filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const data = filtered.slice(startIndex, endIndex);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Implement remaining methods with mock data...
  async findActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.isActive);
  }

  async countByRole(role: UserRole): Promise<number> {
    return Array.from(this.users.values()).filter((user) => user.role === role)
      .length;
  }

  async isEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (
        user.email === email &&
        (!excludeUserId || user.id !== excludeUserId)
      ) {
        return false;
      }
    }
    return true;
  }

  // ... implement remaining interface methods with mock behavior
}
```

## Best Practices

1. **Error Handling**: Proper error mapping và handling for different data sources
2. **Caching Strategy**: Implement caching decorators for performance
3. **Mapping**: Clean separation between domain entities và DTOs
4. **Testing**: Provide mock implementations for testing
5. **Configuration**: Make repositories configurable for different environments
6. **Logging**: Log repository operations for debugging
7. **Retry Logic**: Implement retry logic for network failures

## Testing

```typescript
// repositories/__tests__/ApiUserRepository.test.ts
import { ApiUserRepository } from "../implementations/ApiUserRepository";
import { MockHttpClient } from "../../api/__mocks__/MockHttpClient";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/entities/enums/UserRole";

describe("ApiUserRepository", () => {
  let repository: ApiUserRepository;
  let mockHttpClient: MockHttpClient;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    repository = new ApiUserRepository(mockHttpClient);
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const mockUserDto = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockHttpClient.get.mockResolvedValue({ data: mockUserDto });

      const result = await repository.findById("1");

      expect(result).toBeInstanceOf(User);
      expect(result?.name).toBe("John Doe");
      expect(mockHttpClient.get).toHaveBeenCalledWith("/users/1");
    });

    it("should return null when user not found", async () => {
      mockHttpClient.get.mockRejectedValue({ status: 404 });

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });
});
```

## Lưu ý

- Repository implementations thuộc về infrastructure layer
- Implement proper error handling và mapping
- Use caching strategies để improve performance
- Provide mock implementations cho testing
- Keep repositories focused on data access, không chứa business logic
- Use mappers để convert giữa entities và DTOs
- Consider offline capabilities với local storage repositories
