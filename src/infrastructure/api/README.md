# Infrastructure API

Thư mục này chứa các API clients và adapters - implementation của các interfaces để giao tiếp với external services.

## Mục đích

Infrastructure API layer chứa:

- HTTP clients và API adapters
- External service integrations
- Third-party API wrappers
- Authentication và authorization handlers
- Request/response transformations
- Error handling và retry logic

## Cấu trúc và Quy ước

### Cấu trúc file

```
api/
├── clients/
│   ├── HttpClient.ts           # Base HTTP client
│   ├── AuthApiClient.ts        # Authentication API client
│   ├── UserApiClient.ts        # User management API client
│   ├── ProductApiClient.ts     # Product API client
│   └── PaymentApiClient.ts     # Payment gateway client
├── adapters/
│   ├── UserRepositoryAdapter.ts    # User repository implementation
│   ├── ProductRepositoryAdapter.ts # Product repository implementation
│   └── OrderRepositoryAdapter.ts   # Order repository implementation
├── interceptors/
│   ├── AuthInterceptor.ts      # Authentication interceptor
│   ├── ErrorInterceptor.ts     # Error handling interceptor
│   └── LoggingInterceptor.ts   # Request/response logging
├── types/
│   ├── ApiTypes.ts             # API request/response types
│   ├── ErrorTypes.ts           # API error types
│   └── ClientTypes.ts          # Client configuration types
└── utils/
    ├── RequestBuilder.ts       # Request builder utility
    ├── ResponseMapper.ts       # Response mapping utility
    └── ApiHelper.ts            # Common API utilities
```

### Quy ước đặt tên

- API clients: `UserApiClient`, `ProductApiClient`
- Repository adapters: `UserRepositoryAdapter`
- Interceptors: `AuthInterceptor`, `ErrorInterceptor`
- Suffix `Client` cho API clients, `Adapter` cho repository implementations

## Ví dụ Implementation

### Base HTTP Client

```typescript
// api/clients/HttpClient.ts
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export abstract class BaseHttpClient {
  protected config: HttpClientConfig;
  protected interceptors: RequestInterceptor[] = [];

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.setupDefaultInterceptors();
  }

  // HTTP Methods
  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, { params });
  }

  async post<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, { data });
  }

  async put<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, { data });
  }

  async patch<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", url, { data });
  }

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url);
  }

  // Core request method
  protected async request<T>(
    method: string,
    url: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    try {
      // Build full URL
      const fullUrl = this.buildUrl(url);

      // Apply interceptors
      const requestConfig = await this.applyRequestInterceptors({
        method,
        url: fullUrl,
        ...options,
      });

      // Make request with retry logic
      const response = await this.executeWithRetry(requestConfig);

      // Apply response interceptors
      return await this.applyResponseInterceptors(response);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  private async executeWithRetry(config: RequestConfig): Promise<HttpResponse> {
    const maxAttempts = this.config.retryAttempts || 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeRequest(config);
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts || !this.shouldRetry(error)) {
          break;
        }

        await this.delay(this.config.retryDelay || 1000 * attempt);
      }
    }

    throw lastError;
  }

  protected abstract executeRequest(
    config: RequestConfig
  ): Promise<HttpResponse>;

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }

  private async applyRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let modifiedConfig = config;

    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        modifiedConfig = await interceptor.request(modifiedConfig);
      }
    }

    return modifiedConfig;
  }

  private async applyResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let modifiedResponse = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.response) {
        modifiedResponse = await interceptor.response(modifiedResponse);
      }
    }

    return modifiedResponse;
  }

  private buildUrl(path: string): string {
    const baseURL = this.config.baseURL.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");
    return `${baseURL}/${cleanPath}`;
  }

  private async handleError(error: any): Promise<HttpError> {
    const httpError: HttpError = {
      message: error.message || "An error occurred",
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };

    // Apply error interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.error) {
        await interceptor.error(httpError);
      }
    }

    return httpError;
  }

  private setupDefaultInterceptors(): void {
    // Add default request/response interceptors
    this.addRequestInterceptor(new LoggingInterceptor());
    this.addRequestInterceptor(new ErrorInterceptor());
  }
}

export interface RequestInterceptor {
  request?(config: RequestConfig): Promise<RequestConfig>;
  response?<T>(response: HttpResponse<T>): Promise<HttpResponse<T>>;
  error?(error: HttpError): Promise<void>;
}

export interface RequestConfig {
  method: string;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}
```

### Fetch-based HTTP Client Implementation

```typescript
// api/clients/FetchHttpClient.ts
import { BaseHttpClient, HttpResponse, RequestConfig } from "./HttpClient";

export class FetchHttpClient extends BaseHttpClient {
  protected async executeRequest(config: RequestConfig): Promise<HttpResponse> {
    const { method, url, data, params, headers = {} } = config;

    // Build URL with query parameters
    const requestUrl = this.buildUrlWithParams(url, params);

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...this.config.headers,
        ...headers,
      },
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    };

    // Add body for POST/PUT/PATCH requests
    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(requestUrl, fetchOptions);

    // Parse response
    let responseData: any;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Check for HTTP errors
    if (!response.ok) {
      throw {
        message: `HTTP Error: ${response.status} ${response.statusText}`,
        status: response.status,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: this.parseHeaders(response.headers),
    };
  }

  private buildUrlWithParams(
    url: string,
    params?: Record<string, any>
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.append(key, String(value));
      }
    });

    return urlObj.toString();
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }
}
```

### API Client Implementation

```typescript
// api/clients/UserApiClient.ts
import { FetchHttpClient } from "./FetchHttpClient";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
} from "../../domain/dto/UserDTO";
import {
  PaginatedResponseDTO,
  PaginationDTO,
} from "../../domain/dto/common/PaginationDTO";

export interface UserApiClient {
  getUsers(
    pagination?: PaginationDTO
  ): Promise<PaginatedResponseDTO<UserResponseDTO>>;
  getUserById(id: string): Promise<UserResponseDTO>;
  getUserByEmail(email: string): Promise<UserResponseDTO>;
  createUser(userData: CreateUserDTO): Promise<UserResponseDTO>;
  updateUser(id: string, userData: UpdateUserDTO): Promise<UserResponseDTO>;
  deleteUser(id: string): Promise<void>;
  searchUsers(
    query: string,
    pagination?: PaginationDTO
  ): Promise<PaginatedResponseDTO<UserResponseDTO>>;
}

export class UserApiClientImpl
  extends FetchHttpClient
  implements UserApiClient
{
  constructor() {
    super({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    });
  }

  async getUsers(
    pagination?: PaginationDTO
  ): Promise<PaginatedResponseDTO<UserResponseDTO>> {
    const params = pagination
      ? {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
        }
      : undefined;

    const response = await this.get<PaginatedResponseDTO<UserResponseDTO>>(
      "/users",
      params
    );
    return response.data;
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const response = await this.get<UserResponseDTO>(`/users/${id}`);
    return response.data;
  }

  async getUserByEmail(email: string): Promise<UserResponseDTO> {
    const response = await this.get<UserResponseDTO>("/users/by-email", {
      email,
    });
    return response.data;
  }

  async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
    const response = await this.post<UserResponseDTO>("/users", userData);
    return response.data;
  }

  async updateUser(
    id: string,
    userData: UpdateUserDTO
  ): Promise<UserResponseDTO> {
    const response = await this.put<UserResponseDTO>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(`/users/${id}`);
  }

  async searchUsers(
    query: string,
    pagination?: PaginationDTO
  ): Promise<PaginatedResponseDTO<UserResponseDTO>> {
    const params = {
      q: query,
      ...(pagination && {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
      }),
    };

    const response = await this.get<PaginatedResponseDTO<UserResponseDTO>>(
      "/users/search",
      params
    );
    return response.data;
  }
}
```

### Repository Adapter Implementation

```typescript
// api/adapters/UserRepositoryAdapter.ts
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserRole } from "../../domain/entities/enums/UserRole";
import { UserApiClient } from "../clients/UserApiClient";
import { CreateUserDTOImpl } from "../../domain/dto/user/CreateUserDTO";
import { UpdateUserDTOImpl } from "../../domain/dto/user/UpdateUserDTO";
import {
  PaginationDTOImpl,
  IPaginatedResult,
} from "../../domain/dto/common/PaginationDTO";
import { IPaginationOptions } from "../../domain/repositories/base/IRepository";

export class UserRepositoryAdapter implements IUserRepository {
  constructor(private apiClient: UserApiClient) {}

  async findById(id: string): Promise<User | null> {
    try {
      const userDto = await this.apiClient.getUserById(id);
      return this.mapDtoToEntity(userDto);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw this.mapApiError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDto = await this.apiClient.getUserByEmail(email);
      return this.mapDtoToEntity(userDto);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw this.mapApiError(error);
    }
  }

  async findAll(): Promise<User[]> {
    const response = await this.apiClient.getUsers();
    return response.data.map((dto) => this.mapDtoToEntity(dto));
  }

  async save(user: User): Promise<User> {
    try {
      const createDto = new CreateUserDTOImpl(
        user.name,
        user.email,
        user.passwordHash,
        user.role,
        user.phoneNumber,
        user.dateOfBirth
      );

      const createdUserDto = await this.apiClient.createUser(createDto);
      return this.mapDtoToEntity(createdUserDto);
    } catch (error: any) {
      throw this.mapApiError(error);
    }
  }

  async update(user: User): Promise<User> {
    try {
      const updateDto = new UpdateUserDTOImpl(
        user.name,
        user.email,
        user.phoneNumber,
        user.dateOfBirth,
        user.isActive
      );

      const updatedUserDto = await this.apiClient.updateUser(
        user.id,
        updateDto
      );
      return this.mapDtoToEntity(updatedUserDto);
    } catch (error: any) {
      throw this.mapApiError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.deleteUser(id);
    } catch (error: any) {
      throw this.mapApiError(error);
    }
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    // This would require additional API endpoint
    const allUsers = await this.findAll();
    return allUsers.filter((user) => user.role === role);
  }

  async searchByName(
    name: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<User>> {
    const pagination = options
      ? new PaginationDTOImpl(
          options.page,
          options.limit,
          options.sortBy,
          options.sortOrder
        )
      : undefined;

    const response = await this.apiClient.searchUsers(name, pagination);

    return {
      data: response.data.map((dto) => this.mapDtoToEntity(dto)),
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
      hasNext: response.pagination.hasNext,
      hasPrev: response.pagination.hasPrev,
    };
  }

  // Additional repository methods implementation...
  async findActiveUsers(): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter((user) => user.isActive);
  }

  async countByRole(role: UserRole): Promise<number> {
    const usersByRole = await this.findByRole(role);
    return usersByRole.length;
  }

  async isEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const existingUser = await this.findByEmail(email);
      return (
        !existingUser || (excludeUserId && existingUser.id === excludeUserId)
      );
    } catch {
      return true;
    }
  }

  // Implement other required methods...
  async saveMany(entities: User[]): Promise<User[]> {
    const results: User[] = [];
    for (const entity of entities) {
      results.push(await this.save(entity));
    }
    return results;
  }

  async deleteMany(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async count(): Promise<number> {
    const users = await this.findAll();
    return users.length;
  }

  // Additional business-specific methods would be implemented here...

  // Mapping utilities
  private mapDtoToEntity(dto: UserResponseDTO): User {
    return User.reconstitute({
      id: dto.id,
      name: dto.name,
      email: dto.email,
      passwordHash: "", // Password hash not returned from API for security
      role: dto.role as UserRole,
      phoneNumber: dto.phoneNumber,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      isActive: dto.isActive,
      emailVerified: true, // Assume verified if returned from API
      createdAt: new Date(dto.createdAt),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    });
  }

  private mapApiError(error: any): Error {
    if (error.status) {
      return new Error(`API Error ${error.status}: ${error.message}`);
    }
    return new Error(error.message || "Unknown API error");
  }
}
```

### Authentication Interceptor

```typescript
// api/interceptors/AuthInterceptor.ts
import { RequestInterceptor, RequestConfig } from "../clients/HttpClient";

export class AuthInterceptor implements RequestInterceptor {
  private tokenProvider: () => string | null;

  constructor(tokenProvider: () => string | null) {
    this.tokenProvider = tokenProvider;
  }

  async request(config: RequestConfig): Promise<RequestConfig> {
    const token = this.tokenProvider();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  }
}
```

### Error Interceptor

```typescript
// api/interceptors/ErrorInterceptor.ts
import { RequestInterceptor, HttpError } from "../clients/HttpClient";

export class ErrorInterceptor implements RequestInterceptor {
  async error(error: HttpError): Promise<void> {
    // Log error
    console.error("API Error:", error);

    // Handle specific error codes
    switch (error.status) {
      case 401:
        // Redirect to login or refresh token
        this.handleUnauthorized();
        break;
      case 403:
        // Handle forbidden access
        this.handleForbidden();
        break;
      case 500:
        // Handle server errors
        this.handleServerError(error);
        break;
    }
  }

  private handleUnauthorized(): void {
    // Clear auth tokens and redirect to login
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }

  private handleForbidden(): void {
    // Show access denied message
    console.warn("Access denied");
  }

  private handleServerError(error: HttpError): void {
    // Show generic error message to user
    console.error("Server error occurred:", error.message);
  }
}
```

## Best Practices

1. **Error Handling**: Proper error mapping và handling
2. **Retry Logic**: Implement retry logic cho network failures
3. **Interceptors**: Sử dụng interceptors cho cross-cutting concerns
4. **Type Safety**: Strong typing cho API requests/responses
5. **Configuration**: Configurable timeouts, base URLs, retry policies
6. **Logging**: Comprehensive logging cho debugging
7. **Testing**: Mock API responses cho testing

## Testing

```typescript
// api/__tests__/UserApiClient.test.ts
import { UserApiClientImpl } from "../clients/UserApiClient";

// Mock fetch
global.fetch = jest.fn();

describe("UserApiClient", () => {
  let client: UserApiClientImpl;

  beforeEach(() => {
    client = new UserApiClientImpl();
    (fetch as jest.Mock).mockClear();
  });

  it("should get user by id", async () => {
    const mockUser = { id: "1", name: "John Doe", email: "john@example.com" };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
      headers: new Map(),
    });

    const result = await client.getUserById("1");

    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/1"),
      expect.any(Object)
    );
  });
});
```

## Lưu ý

- API clients chỉ handle HTTP communication, không chứa business logic
- Repository adapters convert giữa domain entities và DTOs
- Sử dụng interceptors cho authentication, logging, error handling
- Implement proper retry logic và timeout handling
- Keep API clients focused và single-purpose
- Use dependency injection để inject API clients vào repository adapters
