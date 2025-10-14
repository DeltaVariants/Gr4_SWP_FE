# Domain Entities

Thư mục này chứa các Business Entities - core domain objects trong Clean Architecture. Đây là trái tim của business logic.

## Mục đích

Domain Entities chứa:

- Core business data và behavior
- Business rules và invariants
- Domain logic và validation
- Rich domain models với behavior
- Enterprise-wide business rules

## Cấu trúc và Quy ước

### Cấu trúc file

```
entities/
├── User.ts                     # User domain entity
├── Product.ts                  # Product domain entity
├── Order.ts                    # Order domain entity
├── Category.ts                 # Product category entity
├── base/
│   ├── BaseEntity.ts           # Base entity with common properties
│   ├── AggregateRoot.ts        # Domain aggregate root
│   └── ValueObject.ts          # Value object base class
├── events/
│   ├── UserCreatedEvent.ts     # Domain events
│   └── OrderProcessedEvent.ts
└── enums/
    ├── UserRole.ts             # User role enumeration
    └── OrderStatus.ts          # Order status enumeration
```

### Quy ước đặt tên

- PascalCase cho entity names: `User`, `Product`, `OrderItem`
- Singular nouns: `User` not `Users`
- Clear, domain-specific names
- Avoid technical suffixes like `Entity` in names

## Ví dụ Implementation

### Base Entity

```typescript
// entities/base/BaseEntity.ts
export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(id: string, createdAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
  }

  public equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }

  public markAsUpdated(): void {
    (this as any).updatedAt = new Date();
  }

  protected validateId(id: string): void {
    if (!id || id.trim() === "") {
      throw new Error("Entity ID cannot be empty");
    }
  }
}
```

### Value Object Base

```typescript
// entities/base/ValueObject.ts
export abstract class ValueObject {
  public abstract equals(other: ValueObject): boolean;

  protected abstract getEqualityComponents(): any[];

  public equals(other: ValueObject): boolean {
    if (!other || other.constructor !== this.constructor) {
      return false;
    }

    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    if (thisComponents.length !== otherComponents.length) {
      return false;
    }

    return thisComponents.every(
      (component, index) => component === otherComponents[index]
    );
  }
}
```

### Domain Events

```typescript
// entities/base/DomainEvent.ts
export interface DomainEvent {
  aggregateId: string;
  eventType: string;
  occurredOn: Date;
  eventData: any;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string,
    public readonly eventData: any
  ) {
    this.occurredOn = new Date();
  }
}
```

### User Entity

```typescript
// entities/User.ts
import { BaseEntity } from "./base/BaseEntity";
import { UserRole } from "./enums/UserRole";
import { Email } from "./values/Email";
import { UserCreatedEvent } from "./events/UserCreatedEvent";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phoneNumber?: string;
  dateOfBirth?: Date;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: Email;
  private _passwordHash: string;
  private _role: UserRole;
  private _phoneNumber?: string;
  private _dateOfBirth?: Date;
  private _isActive: boolean;
  private _emailVerified: boolean;
  private _lastLoginAt?: Date;
  private _domainEvents: BaseDomainEvent[] = [];

  constructor(props: UserProps) {
    super(props.id, props.createdAt);

    this._name = props.name;
    this._email = new Email(props.email);
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._phoneNumber = props.phoneNumber;
    this._dateOfBirth = props.dateOfBirth;
    this._isActive = props.isActive;
    this._emailVerified = props.emailVerified;
    this._lastLoginAt = props.lastLoginAt;

    this.validate();

    // Raise domain event for new users
    if (!props.createdAt) {
      this.addDomainEvent(
        new UserCreatedEvent(this.id, {
          name: this._name,
          email: this._email.value,
          role: this._role,
        })
      );
    }
  }

  // Getters
  public get name(): string {
    return this._name;
  }
  public get email(): string {
    return this._email.value;
  }
  public get passwordHash(): string {
    return this._passwordHash;
  }
  public get role(): UserRole {
    return this._role;
  }
  public get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }
  public get dateOfBirth(): Date | undefined {
    return this._dateOfBirth;
  }
  public get isActive(): boolean {
    return this._isActive;
  }
  public get emailVerified(): boolean {
    return this._emailVerified;
  }
  public get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }
  public get domainEvents(): BaseDomainEvent[] {
    return [...this._domainEvents];
  }

  // Business Methods
  public updateProfile(
    name: string,
    phoneNumber?: string,
    dateOfBirth?: Date
  ): void {
    this.validateName(name);

    this._name = name;
    this._phoneNumber = phoneNumber;
    this._dateOfBirth = dateOfBirth;

    this.markAsUpdated();
  }

  public changeEmail(newEmail: string): void {
    const email = new Email(newEmail);

    if (this._email.equals(email)) {
      return; // No change needed
    }

    this._email = email;
    this._emailVerified = false; // Reset verification status

    this.markAsUpdated();
  }

  public changePassword(newPasswordHash: string): void {
    this.validatePasswordHash(newPasswordHash);

    this._passwordHash = newPasswordHash;
    this.markAsUpdated();
  }

  public promote(newRole: UserRole): void {
    if (this._role === newRole) {
      return;
    }

    this.validateRoleChange(this._role, newRole);

    this._role = newRole;
    this.markAsUpdated();
  }

  public deactivate(): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;
    this.markAsUpdated();
  }

  public activate(): void {
    if (this._isActive) {
      return;
    }

    this._isActive = true;
    this.markAsUpdated();
  }

  public verifyEmail(): void {
    if (this._emailVerified) {
      return;
    }

    this._emailVerified = true;
    this.markAsUpdated();
  }

  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this.markAsUpdated();
  }

  public canPerformAction(action: string): boolean {
    if (!this._isActive) {
      return false;
    }

    switch (action) {
      case "CREATE_PRODUCT":
        return this._role === UserRole.ADMIN || this._role === UserRole.MANAGER;
      case "DELETE_USER":
        return this._role === UserRole.ADMIN;
      case "VIEW_ANALYTICS":
        return this._role !== UserRole.USER;
      default:
        return true;
    }
  }

  public getAge(): number | null {
    if (!this._dateOfBirth) {
      return null;
    }

    const today = new Date();
    const birthDate = new Date(this._dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  public isAdult(): boolean {
    const age = this.getAge();
    return age !== null && age >= 18;
  }

  // Domain Events
  private addDomainEvent(event: BaseDomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Validation
  private validate(): void {
    this.validateName(this._name);
    this.validatePasswordHash(this._passwordHash);

    if (this._dateOfBirth) {
      this.validateDateOfBirth(this._dateOfBirth);
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error("User name must be at least 2 characters long");
    }

    if (name.length > 100) {
      throw new Error("User name cannot exceed 100 characters");
    }
  }

  private validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim() === "") {
      throw new Error("Password hash cannot be empty");
    }
  }

  private validateDateOfBirth(dateOfBirth: Date): void {
    const today = new Date();

    if (dateOfBirth > today) {
      throw new Error("Date of birth cannot be in the future");
    }

    const age = today.getFullYear() - dateOfBirth.getFullYear();
    if (age > 150) {
      throw new Error("Invalid date of birth");
    }
  }

  private validateRoleChange(currentRole: UserRole, newRole: UserRole): void {
    // Business rule: Only admins can promote to admin
    if (newRole === UserRole.ADMIN && currentRole !== UserRole.ADMIN) {
      throw new Error("Only administrators can promote users to admin role");
    }
  }

  // Factory Methods
  public static create(
    props: Omit<UserProps, "id" | "createdAt" | "updatedAt">
  ): User {
    const id = this.generateId();

    return new User({
      ...props,
      id,
      isActive: props.isActive ?? true,
      emailVerified: props.emailVerified ?? false,
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private static generateId(): string {
    return "user_" + Math.random().toString(36).substr(2, 9);
  }

  // Serialization
  public toSnapshot(): UserProps {
    return {
      id: this.id,
      name: this._name,
      email: this._email.value,
      passwordHash: this._passwordHash,
      role: this._role,
      phoneNumber: this._phoneNumber,
      dateOfBirth: this._dateOfBirth,
      isActive: this._isActive,
      emailVerified: this._emailVerified,
      lastLoginAt: this._lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
```

### Value Objects

```typescript
// entities/values/Email.ts
import { ValueObject } from "../base/ValueObject";

export class Email extends ValueObject {
  private readonly _value: string;

  constructor(email: string) {
    super();
    this.validate(email);
    this._value = email.toLowerCase().trim();
  }

  public get value(): string {
    return this._value;
  }

  protected getEqualityComponents(): any[] {
    return [this._value];
  }

  private validate(email: string): void {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (email.length > 254) {
      throw new Error("Email address too long");
    }
  }
}
```

```typescript
// entities/values/Money.ts
import { ValueObject } from "../base/ValueObject";

export class Money extends ValueObject {
  constructor(
    private readonly _amount: number,
    private readonly _currency: string
  ) {
    super();
    this.validate();
  }

  public get amount(): number {
    return this._amount;
  }
  public get currency(): string {
    return this._currency;
  }

  public add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error("Cannot add money with different currencies");
    }

    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error("Cannot subtract money with different currencies");
    }

    return new Money(this._amount - other._amount, this._currency);
  }

  public multiply(multiplier: number): Money {
    return new Money(this._amount * multiplier, this._currency);
  }

  public isPositive(): boolean {
    return this._amount > 0;
  }

  public isZero(): boolean {
    return this._amount === 0;
  }

  protected getEqualityComponents(): any[] {
    return [this._amount, this._currency];
  }

  private validate(): void {
    if (this._currency.length !== 3) {
      throw new Error("Currency code must be 3 characters long");
    }

    if (!Number.isFinite(this._amount)) {
      throw new Error("Amount must be a finite number");
    }
  }
}
```

### Enumerations

```typescript
// entities/enums/UserRole.ts
export enum UserRole {
  USER = "user",
  MANAGER = "manager",
  ADMIN = "admin",
}

export class UserRoleUtils {
  public static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  public static isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }

  public static getHierarchyLevel(role: UserRole): number {
    switch (role) {
      case UserRole.USER:
        return 1;
      case UserRole.MANAGER:
        return 2;
      case UserRole.ADMIN:
        return 3;
      default:
        return 0;
    }
  }

  public static canPromoteTo(
    currentRole: UserRole,
    targetRole: UserRole
  ): boolean {
    return (
      this.getHierarchyLevel(currentRole) >= this.getHierarchyLevel(targetRole)
    );
  }
}
```

### Domain Events

```typescript
// entities/events/UserCreatedEvent.ts
import { BaseDomainEvent } from "../base/DomainEvent";

export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    userId: string,
    userData: {
      name: string;
      email: string;
      role: string;
    }
  ) {
    super(userId, "UserCreated", userData);
  }
}
```

## Aggregate Root Example

```typescript
// entities/Order.ts
import { BaseEntity } from "./base/BaseEntity";
import { Money } from "./values/Money";
import { OrderStatus } from "./enums/OrderStatus";

export class Order extends BaseEntity {
  private _customerId: string;
  private _items: OrderItem[] = [];
  private _status: OrderStatus;
  private _totalAmount: Money;
  private _shippingAddress: Address;

  constructor(props: OrderProps) {
    super(props.id, props.createdAt);
    // ... initialization
    this.recalculateTotal();
  }

  // Business Methods
  public addItem(productId: string, quantity: number, unitPrice: Money): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error("Cannot modify confirmed order");
    }

    const existingItem = this._items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + quantity);
    } else {
      this._items.push(new OrderItem(productId, quantity, unitPrice));
    }

    this.recalculateTotal();
  }

  public removeItem(productId: string): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error("Cannot modify confirmed order");
    }

    this._items = this._items.filter((item) => item.productId !== productId);
    this.recalculateTotal();
  }

  public confirm(): void {
    if (this._items.length === 0) {
      throw new Error("Cannot confirm empty order");
    }

    if (this._status !== OrderStatus.DRAFT) {
      throw new Error("Order is already confirmed");
    }

    this._status = OrderStatus.CONFIRMED;
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new OrderConfirmedEvent(this.id, {
        customerId: this._customerId,
        totalAmount: this._totalAmount.amount,
        currency: this._totalAmount.currency,
      })
    );
  }

  private recalculateTotal(): void {
    if (this._items.length === 0) {
      this._totalAmount = new Money(0, "USD");
      return;
    }

    const total = this._items.reduce((sum, item) => {
      return sum.add(item.getSubtotal());
    }, new Money(0, this._items[0].unitPrice.currency));

    this._totalAmount = total;
  }

  // Invariant validation
  private validateInvariants(): void {
    if (this._items.length > 50) {
      throw new Error("Order cannot have more than 50 items");
    }

    if (this._totalAmount.amount < 0) {
      throw new Error("Order total cannot be negative");
    }
  }
}
```

## Best Practices

1. **Rich Domain Models**: Entities chứa behavior, không chỉ data
2. **Encapsulation**: Private fields với public methods
3. **Immutability**: Value objects nên immutable
4. **Validation**: Validate business rules trong entities
5. **Domain Events**: Sử dụng domain events cho side effects
6. **Factory Methods**: Provide factory methods để tạo entities
7. **Aggregate Boundaries**: Rõ ràng về aggregate boundaries

## Testing

```typescript
// entities/__tests__/User.test.ts
import { User } from "../User";
import { UserRole } from "../enums/UserRole";

describe("User Entity", () => {
  describe("creation", () => {
    it("should create user with valid data", () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashedpassword",
        role: UserRole.USER,
        isActive: true,
        emailVerified: false,
      });

      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.role).toBe(UserRole.USER);
    });

    it("should throw error for invalid email", () => {
      expect(() => {
        User.create({
          name: "John Doe",
          email: "invalid-email",
          passwordHash: "hashedpassword",
          role: UserRole.USER,
          isActive: true,
          emailVerified: false,
        });
      }).toThrow("Invalid email format");
    });
  });

  describe("business methods", () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashedpassword",
        role: UserRole.USER,
        isActive: true,
        emailVerified: false,
      });
    });

    it("should update profile correctly", () => {
      user.updateProfile("Jane Doe", "123-456-7890");

      expect(user.name).toBe("Jane Doe");
      expect(user.phoneNumber).toBe("123-456-7890");
    });

    it("should verify email", () => {
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
    });

    it("should check permissions correctly", () => {
      expect(user.canPerformAction("CREATE_PRODUCT")).toBe(false);

      user.promote(UserRole.ADMIN);
      expect(user.canPerformAction("CREATE_PRODUCT")).toBe(true);
    });
  });
});
```

## Lưu ý

- Entities chứa business logic và behavior, không chỉ là data containers
- Validate business rules trong constructor và business methods
- Sử dụng value objects cho complex values như Email, Money
- Implement domain events để handle side effects
- Keep entities focused on single responsibility
- Use factory methods để tạo entities với proper validation
- Entities không nên depend vào external services
