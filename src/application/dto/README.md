# Domain DTOs (Data Transfer Objects)

Thư mục này chứa các Data Transfer Objects - đối tượng dùng để transfer data giữa các layers trong Clean Architecture.

## Mục đích

DTOs phục vụ các mục đích:

- Transfer data giữa layers mà không expose internal entities
- Validate input data từ external sources
- Define contracts cho API requests/responses
- Serialize/deserialize data
- Transform data formats

## Cấu trúc và Quy ước

### Cấu trúc file

```
dto/
├── user/
│   ├── CreateUserDTO.ts         # Create user request
│   ├── UpdateUserDTO.ts         # Update user request
│   ├── UserResponseDTO.ts       # User response data
│   └── UserListDTO.ts           # User list with pagination
├── auth/
│   ├── LoginDTO.ts              # Login credentials
│   ├── RegisterDTO.ts           # Registration data
│   └── AuthResponseDTO.ts       # Authentication response
├── product/
│   ├── CreateProductDTO.ts      # Create product request
│   ├── ProductFilterDTO.ts      # Product filtering options
│   └── ProductResponseDTO.ts    # Product response data
├── common/
│   ├── PaginationDTO.ts         # Common pagination
│   ├── ResponseDTO.ts           # Generic API response
│   └── ErrorDTO.ts              # Error response format
└── base/
    └── BaseDTO.ts               # Base DTO interface
```

### Quy ước đặt tên

- Sử dụng suffix `DTO`: `CreateUserDTO`, `LoginDTO`
- Tên phản ánh purpose: `Create`, `Update`, `Response`, `Request`
- PascalCase cho class/interface names
- Grouping theo domain/feature

## Ví dụ Implementation

### Base DTO

```typescript
// dto/base/BaseDTO.ts
export interface BaseDTO {
  validate?(): boolean;
  toEntity?(): any;
  fromEntity?(entity: any): void;
}

export abstract class BaseValidationDTO implements BaseDTO {
  abstract validate(): boolean;

  protected validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === "") {
      throw new Error(`${fieldName} is required`);
    }
  }

  protected validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  protected validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): void {
    if (value.length < minLength) {
      throw new Error(
        `${fieldName} must be at least ${minLength} characters long`
      );
    }
  }
}
```

### User DTOs

```typescript
// dto/user/CreateUserDTO.ts
import { BaseValidationDTO } from "../base/BaseDTO";
import { User } from "../../entities/User";

export interface CreateUserDTO extends BaseDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

export class CreateUserDTOImpl
  extends BaseValidationDTO
  implements CreateUserDTO
{
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public role?: string,
    public phoneNumber?: string,
    public dateOfBirth?: Date
  ) {
    super();
  }

  validate(): boolean {
    try {
      this.validateRequired(this.name, "Name");
      this.validateRequired(this.email, "Email");
      this.validateRequired(this.password, "Password");

      this.validateEmail(this.email);
      this.validateMinLength(this.password, 6, "Password");
      this.validateMinLength(this.name, 2, "Name");

      if (this.phoneNumber) {
        this.validatePhoneNumber(this.phoneNumber);
      }

      if (this.dateOfBirth) {
        this.validateDateOfBirth(this.dateOfBirth);
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }

  toEntity(): Partial<User> {
    return {
      name: this.name,
      email: this.email.toLowerCase(),
      role: this.role || "user",
      phoneNumber: this.phoneNumber,
      dateOfBirth: this.dateOfBirth,
      createdAt: new Date(),
      isActive: true,
    };
  }

  private validatePhoneNumber(phoneNumber: string): void {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error("Invalid phone number format");
    }
  }

  private validateDateOfBirth(dateOfBirth: Date): void {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();

    if (age < 13) {
      throw new Error("User must be at least 13 years old");
    }

    if (dateOfBirth > today) {
      throw new Error("Date of birth cannot be in the future");
    }
  }
}
```

```typescript
// dto/user/UpdateUserDTO.ts
import { BaseValidationDTO } from "../base/BaseDTO";

export interface UpdateUserDTO extends BaseDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
}

export class UpdateUserDTOImpl
  extends BaseValidationDTO
  implements UpdateUserDTO
{
  constructor(
    public name?: string,
    public email?: string,
    public phoneNumber?: string,
    public dateOfBirth?: Date,
    public isActive?: boolean
  ) {
    super();
  }

  validate(): boolean {
    try {
      if (this.name !== undefined) {
        this.validateMinLength(this.name, 2, "Name");
      }

      if (this.email !== undefined) {
        this.validateEmail(this.email);
      }

      if (this.phoneNumber !== undefined) {
        this.validatePhoneNumber(this.phoneNumber);
      }

      if (this.dateOfBirth !== undefined) {
        this.validateDateOfBirth(this.dateOfBirth);
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }

  toUpdateObject(): Partial<User> {
    const updateData: Partial<User> = {};

    if (this.name !== undefined) updateData.name = this.name;
    if (this.email !== undefined) updateData.email = this.email.toLowerCase();
    if (this.phoneNumber !== undefined)
      updateData.phoneNumber = this.phoneNumber;
    if (this.dateOfBirth !== undefined)
      updateData.dateOfBirth = this.dateOfBirth;
    if (this.isActive !== undefined) updateData.isActive = this.isActive;

    updateData.updatedAt = new Date();

    return updateData;
  }

  private validatePhoneNumber(phoneNumber: string): void {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error("Invalid phone number format");
    }
  }

  private validateDateOfBirth(dateOfBirth: Date): void {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();

    if (age < 13) {
      throw new Error("User must be at least 13 years old");
    }
  }
}
```

```typescript
// dto/user/UserResponseDTO.ts
import { User } from "../../entities/User";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO string format
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export class UserResponseDTOImpl implements UserResponseDTO {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: string,
    public isActive: boolean,
    public createdAt: string,
    public phoneNumber?: string,
    public dateOfBirth?: string,
    public updatedAt?: string
  ) {}

  static fromEntity(user: User): UserResponseDTO {
    return new UserResponseDTOImpl(
      user.id,
      user.name,
      user.email,
      user.role,
      user.isActive,
      user.createdAt.toISOString(),
      user.phoneNumber,
      user.dateOfBirth?.toISOString(),
      user.updatedAt?.toISOString()
    );
  }

  static fromEntityList(users: User[]): UserResponseDTO[] {
    return users.map((user) => UserResponseDTOImpl.fromEntity(user));
  }
}
```

### Authentication DTOs

```typescript
// dto/auth/LoginDTO.ts
import { BaseValidationDTO } from "../base/BaseDTO";

export interface LoginDTO extends BaseDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class LoginDTOImpl extends BaseValidationDTO implements LoginDTO {
  constructor(
    public email: string,
    public password: string,
    public rememberMe: boolean = false
  ) {
    super();
  }

  validate(): boolean {
    try {
      this.validateRequired(this.email, "Email");
      this.validateRequired(this.password, "Password");
      this.validateEmail(this.email);
      this.validateMinLength(this.password, 6, "Password");
      return true;
    } catch (error) {
      console.error("Login validation error:", error);
      return false;
    }
  }
}
```

```typescript
// dto/auth/AuthResponseDTO.ts
import { UserResponseDTO } from "../user/UserResponseDTO";

export interface AuthResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class AuthResponseDTOImpl implements AuthResponseDTO {
  constructor(
    public user: UserResponseDTO,
    public accessToken: string,
    public refreshToken: string,
    public expiresIn: number,
    public tokenType: string = "Bearer"
  ) {}

  static create(data: {
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }): AuthResponseDTO {
    return new AuthResponseDTOImpl(
      data.user,
      data.accessToken,
      data.refreshToken,
      data.expiresIn
    );
  }
}
```

### Common DTOs

```typescript
// dto/common/PaginationDTO.ts
export interface PaginationDTO {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationDTOImpl implements PaginationDTO {
  constructor(
    public page: number = 1,
    public limit: number = 10,
    public sortBy?: string,
    public sortOrder: "asc" | "desc" = "asc"
  ) {
    // Ensure minimum values
    this.page = Math.max(1, page);
    this.limit = Math.max(1, Math.min(100, limit)); // Max 100 items per page
  }

  validate(): boolean {
    return this.page >= 1 && this.limit >= 1 && this.limit <= 100;
  }

  getOffset(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginatedResponseDTOImpl<T> implements PaginatedResponseDTO<T> {
  constructor(
    public data: T[],
    public pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  ) {}

  static create<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponseDTO<T> {
    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDTOImpl(data, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  }
}
```

```typescript
// dto/common/ResponseDTO.ts
export interface ResponseDTO<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export class ResponseDTOImpl<T> implements ResponseDTO<T> {
  constructor(
    public success: boolean,
    public timestamp: string = new Date().toISOString(),
    public data?: T,
    public message?: string,
    public errors?: string[]
  ) {}

  static success<T>(data: T, message?: string): ResponseDTO<T> {
    return new ResponseDTOImpl(true, new Date().toISOString(), data, message);
  }

  static error<T>(message: string, errors?: string[]): ResponseDTO<T> {
    return new ResponseDTOImpl(
      false,
      new Date().toISOString(),
      undefined,
      message,
      errors
    );
  }
}
```

## Validation Decorators (Optional)

```typescript
// dto/decorators/validation.ts
export function Required(target: any, propertyKey: string) {
  // Implementation for required field validation
}

export function Email(target: any, propertyKey: string) {
  // Implementation for email validation
}

export function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    // Implementation for minimum length validation
  };
}

// Usage example:
export class CreateUserWithDecoratorsDTO {
  @Required
  @MinLength(2)
  name: string;

  @Required
  @Email
  email: string;

  @Required
  @MinLength(6)
  password: string;
}
```

## Best Practices

1. **Validation**: Luôn validate data trước khi sử dụng
2. **Immutability**: DTOs nên được thiết kế immutable
3. **Separation**: Tách riêng request/response DTOs
4. **Naming**: Đặt tên rõ ràng về purpose (Create, Update, Response)
5. **Transformation**: Cung cấp methods để convert to/from entities
6. **Error Handling**: Handle validation errors gracefully
7. **Documentation**: Document validation rules và constraints

## Testing

```typescript
// dto/__tests__/CreateUserDTO.test.ts
import { CreateUserDTOImpl } from "../user/CreateUserDTO";

describe("CreateUserDTO", () => {
  it("should validate valid user data", () => {
    const dto = new CreateUserDTOImpl(
      "John Doe",
      "john@example.com",
      "password123"
    );

    expect(dto.validate()).toBe(true);
  });

  it("should fail validation for invalid email", () => {
    const dto = new CreateUserDTOImpl(
      "John Doe",
      "invalid-email",
      "password123"
    );

    expect(dto.validate()).toBe(false);
  });

  it("should convert to entity correctly", () => {
    const dto = new CreateUserDTOImpl(
      "John Doe",
      "john@example.com",
      "password123"
    );

    const entity = dto.toEntity();

    expect(entity.name).toBe("John Doe");
    expect(entity.email).toBe("john@example.com");
    expect(entity.role).toBe("user");
  });
});
```

## Lưu ý

- DTOs chỉ chứa data và validation logic, không chứa business logic
- Sử dụng TypeScript interfaces để define contracts
- Implement validation methods để ensure data integrity
- Provide transformation methods để convert between DTOs và entities
- Keep DTOs simple và focused on data transfer
- Consider using validation libraries như Joi, Yup, hoặc class-validator cho complex validation
