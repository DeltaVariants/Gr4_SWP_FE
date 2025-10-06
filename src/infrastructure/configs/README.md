# Infrastructure Configs

Thư mục này chứa các configuration files và settings cho infrastructure layer trong Clean Architecture.

## Mục đích

Infrastructure Configs quản lý:

- Application configuration và environment variables
- Database connection settings
- External service configurations
- Feature flags và runtime settings
- Environment-specific configurations
- Security configurations

## Cấu trúc và Quy ước

### Cấu trúc file

```
configs/
├── app/
│   ├── AppConfig.ts            # Main application configuration
│   ├── EnvironmentConfig.ts    # Environment-specific settings
│   └── FeatureFlags.ts         # Feature flag configuration
├── api/
│   ├── ApiConfig.ts            # API endpoints configuration
│   ├── HttpConfig.ts           # HTTP client configuration
│   └── RetryConfig.ts          # Retry policy configuration
├── auth/
│   ├── AuthConfig.ts           # Authentication configuration
│   ├── JwtConfig.ts            # JWT token configuration
│   └── OAuthConfig.ts          # OAuth provider settings
├── storage/
│   ├── DatabaseConfig.ts       # Database configuration
│   ├── CacheConfig.ts          # Caching configuration
│   └── FileStorageConfig.ts    # File storage settings
├── external/
│   ├── PaymentConfig.ts        # Payment gateway configuration
│   ├── EmailConfig.ts          # Email service configuration
│   └── AnalyticsConfig.ts      # Analytics service configuration
└── base/
    ├── ConfigBase.ts           # Base configuration interface
    ├── ConfigLoader.ts         # Configuration loader utility
    └── ConfigValidator.ts      # Configuration validation
```

### Quy ước đặt tên

- Suffix `Config` cho configuration classes: `AppConfig`, `ApiConfig`
- Environment variables sử dụng UPPER_SNAKE_CASE
- Configuration keys sử dụng camelCase
- Group configurations theo domain/feature

## Ví dụ Implementation

### Base Configuration

```typescript
// configs/base/ConfigBase.ts
export interface IConfiguration {
  validate(): boolean;
  get<T>(key: string): T;
  getRequired<T>(key: string): T;
  has(key: string): boolean;
}

export abstract class BaseConfiguration implements IConfiguration {
  protected config: Record<string, any> = {};

  constructor(config: Record<string, any>) {
    this.config = config;
    this.loadDefaults();
    this.validate();
  }

  abstract validate(): boolean;
  protected abstract loadDefaults(): void;

  get<T>(key: string): T {
    return this.getNestedValue(key) as T;
  }

  getRequired<T>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Required configuration key '${key}' is missing`);
    }
    return value;
  }

  has(key: string): boolean {
    return this.getNestedValue(key) !== undefined;
  }

  protected getNestedValue(key: string): any {
    return key.split(".").reduce((obj, k) => obj?.[k], this.config);
  }

  protected setNestedValue(key: string, value: any): void {
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) obj[k] = {};
      return obj[k];
    }, this.config);
    target[lastKey] = value;
  }
}
```

### Configuration Loader

```typescript
// configs/base/ConfigLoader.ts
export interface EnvironmentVariables {
  NODE_ENV?: string;
  PORT?: string;
  API_BASE_URL?: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  REDIS_URL?: string;
  // Add more environment variables as needed
}

export class ConfigLoader {
  private static instance: ConfigLoader;
  private envVars: EnvironmentVariables;

  private constructor() {
    this.envVars = this.loadEnvironmentVariables();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadEnvironmentVariables(): EnvironmentVariables {
    return {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "3000",
      API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      REDIS_URL: process.env.REDIS_URL,
    };
  }

  getEnvironment(): string {
    return this.envVars.NODE_ENV || "development";
  }

  isProduction(): boolean {
    return this.getEnvironment() === "production";
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === "development";
  }

  isTest(): boolean {
    return this.getEnvironment() === "test";
  }

  getEnvVar(key: keyof EnvironmentVariables): string | undefined {
    return this.envVars[key];
  }

  getRequiredEnvVar(key: keyof EnvironmentVariables): string {
    const value = this.envVars[key];
    if (!value) {
      throw new Error(`Required environment variable '${key}' is not set`);
    }
    return value;
  }

  loadConfigFromFile(filePath: string): Record<string, any> {
    try {
      const configFile = require(filePath);
      return configFile.default || configFile;
    } catch (error) {
      console.warn(`Could not load config file from ${filePath}:`, error);
      return {};
    }
  }

  mergeConfigs(...configs: Record<string, any>[]): Record<string, any> {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {});
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}
```

### Application Configuration

```typescript
// configs/app/AppConfig.ts
import { BaseConfiguration } from "../base/ConfigBase";
import { ConfigLoader } from "../base/ConfigLoader";

export interface AppSettings {
  name: string;
  version: string;
  port: number;
  environment: string;
  debug: boolean;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
    enableConsole: boolean;
    enableFile: boolean;
  };
  security: {
    enableHelmet: boolean;
    enableRateLimit: boolean;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
}

export class AppConfig extends BaseConfiguration {
  private configLoader: ConfigLoader;

  constructor() {
    const loader = ConfigLoader.getInstance();
    const config = loader.mergeConfigs(
      loader.loadConfigFromFile("./config/app.json"),
      {
        name: "SWP391 Frontend",
        version: "1.0.0",
        port: parseInt(loader.getEnvVar("PORT") || "3000"),
        environment: loader.getEnvironment(),
        debug: loader.isDevelopment(),
      }
    );

    super(config);
    this.configLoader = loader;
  }

  protected loadDefaults(): void {
    const defaults: AppSettings = {
      name: "SWP391 Application",
      version: "1.0.0",
      port: 3000,
      environment: "development",
      debug: false,
      cors: {
        enabled: true,
        origins: ["http://localhost:3000", "http://localhost:3001"],
      },
      logging: {
        level: "info",
        enableConsole: true,
        enableFile: false,
      },
      security: {
        enableHelmet: true,
        enableRateLimit: true,
        rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
        rateLimitMaxRequests: 100,
      },
    };

    // Merge defaults with current config
    this.config = this.configLoader.mergeConfigs(defaults, this.config);
  }

  validate(): boolean {
    const requiredKeys = ["name", "version", "port", "environment"];

    for (const key of requiredKeys) {
      if (!this.has(key)) {
        throw new Error(`Required app configuration key '${key}' is missing`);
      }
    }

    // Validate port range
    const port = this.get<number>("port");
    if (port < 1 || port > 65535) {
      throw new Error("Port must be between 1 and 65535");
    }

    return true;
  }

  // Convenience methods
  getAppName(): string {
    return this.getRequired<string>("name");
  }

  getPort(): number {
    return this.getRequired<number>("port");
  }

  getEnvironment(): string {
    return this.getRequired<string>("environment");
  }

  isDebugEnabled(): boolean {
    return this.get<boolean>("debug") || false;
  }

  getCorsSettings(): AppSettings["cors"] {
    return this.getRequired<AppSettings["cors"]>("cors");
  }

  getLoggingSettings(): AppSettings["logging"] {
    return this.getRequired<AppSettings["logging"]>("logging");
  }

  getSecuritySettings(): AppSettings["security"] {
    return this.getRequired<AppSettings["security"]>("security");
  }
}
```

### API Configuration

```typescript
// configs/api/ApiConfig.ts
import { BaseConfiguration } from "../base/ConfigBase";
import { ConfigLoader } from "../base/ConfigLoader";

export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    refresh: string;
    logout: string;
  };
  users: {
    base: string;
    profile: string;
    search: string;
  };
  products: {
    base: string;
    categories: string;
    search: string;
  };
}

export interface ApiSettings {
  baseUrl: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  endpoints: ApiEndpoints;
}

export class ApiConfig extends BaseConfiguration {
  constructor() {
    const loader = ConfigLoader.getInstance();
    const baseUrl = loader.getEnvVar("API_BASE_URL") || "http://localhost:3001";

    const config: ApiSettings = {
      baseUrl,
      version: "v1",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      endpoints: {
        auth: {
          login: "/auth/login",
          register: "/auth/register",
          refresh: "/auth/refresh",
          logout: "/auth/logout",
        },
        users: {
          base: "/users",
          profile: "/users/profile",
          search: "/users/search",
        },
        products: {
          base: "/products",
          categories: "/products/categories",
          search: "/products/search",
        },
      },
    };

    super(config);
  }

  protected loadDefaults(): void {
    // Defaults are set in constructor
  }

  validate(): boolean {
    const requiredKeys = ["baseUrl", "version", "timeout"];

    for (const key of requiredKeys) {
      if (!this.has(key)) {
        throw new Error(`Required API configuration key '${key}' is missing`);
      }
    }

    // Validate base URL format
    const baseUrl = this.get<string>("baseUrl");
    try {
      new URL(baseUrl);
    } catch {
      throw new Error("Invalid API base URL format");
    }

    return true;
  }

  getBaseUrl(): string {
    return this.getRequired<string>("baseUrl");
  }

  getFullUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl().replace(/\/$/, "");
    const version = this.get<string>("version");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    return `${baseUrl}/api/${version}/${cleanEndpoint}`;
  }

  getTimeout(): number {
    return this.get<number>("timeout");
  }

  getRetryConfig(): { attempts: number; delay: number } {
    return {
      attempts: this.get<number>("retryAttempts"),
      delay: this.get<number>("retryDelay"),
    };
  }

  getEndpoint(category: keyof ApiEndpoints, endpoint: string): string {
    const endpoints = this.get<ApiEndpoints>("endpoints");
    const categoryEndpoints = endpoints[category] as any;
    return categoryEndpoints[endpoint] || endpoint;
  }

  // Convenience methods for specific endpoints
  getAuthEndpoint(endpoint: keyof ApiEndpoints["auth"]): string {
    return this.getFullUrl(this.getEndpoint("auth", endpoint));
  }

  getUsersEndpoint(endpoint: keyof ApiEndpoints["users"]): string {
    return this.getFullUrl(this.getEndpoint("users", endpoint));
  }

  getProductsEndpoint(endpoint: keyof ApiEndpoints["products"]): string {
    return this.getFullUrl(this.getEndpoint("products", endpoint));
  }
}
```

### Authentication Configuration

```typescript
// configs/auth/AuthConfig.ts
import { BaseConfiguration } from "../base/ConfigBase";
import { ConfigLoader } from "../base/ConfigLoader";

export interface AuthSettings {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      enabled: boolean;
    };
    github: {
      clientId: string;
      clientSecret: string;
      enabled: boolean;
    };
  };
  session: {
    name: string;
    secret: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export class AuthConfig extends BaseConfiguration {
  constructor() {
    const loader = ConfigLoader.getInstance();

    const config: AuthSettings = {
      jwt: {
        secret: loader.getRequiredEnvVar("JWT_SECRET"),
        expiresIn: loader.getEnvVar("JWT_EXPIRES_IN") || "1h",
        refreshExpiresIn: loader.getEnvVar("JWT_REFRESH_EXPIRES_IN") || "7d",
        algorithm: "HS256",
      },
      oauth: {
        google: {
          clientId: loader.getEnvVar("GOOGLE_CLIENT_ID") || "",
          clientSecret: loader.getEnvVar("GOOGLE_CLIENT_SECRET") || "",
          enabled: !!(
            loader.getEnvVar("GOOGLE_CLIENT_ID") &&
            loader.getEnvVar("GOOGLE_CLIENT_SECRET")
          ),
        },
        github: {
          clientId: loader.getEnvVar("GITHUB_CLIENT_ID") || "",
          clientSecret: loader.getEnvVar("GITHUB_CLIENT_SECRET") || "",
          enabled: !!(
            loader.getEnvVar("GITHUB_CLIENT_ID") &&
            loader.getEnvVar("GITHUB_CLIENT_SECRET")
          ),
        },
      },
      session: {
        name: "swp391-session",
        secret:
          loader.getEnvVar("SESSION_SECRET") ||
          loader.getRequiredEnvVar("JWT_SECRET"),
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: loader.isProduction(),
        httpOnly: true,
      },
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      },
    };

    super(config);
  }

  protected loadDefaults(): void {
    // Defaults are set in constructor
  }

  validate(): boolean {
    // Validate JWT secret
    const jwtSecret = this.get<string>("jwt.secret");
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error("JWT secret must be at least 32 characters long");
    }

    // Validate password requirements
    const passwordConfig = this.get<AuthSettings["password"]>("password");
    if (passwordConfig.minLength < 6) {
      throw new Error("Password minimum length must be at least 6");
    }

    return true;
  }

  getJwtConfig(): AuthSettings["jwt"] {
    return this.getRequired<AuthSettings["jwt"]>("jwt");
  }

  getOAuthConfig(): AuthSettings["oauth"] {
    return this.getRequired<AuthSettings["oauth"]>("oauth");
  }

  getSessionConfig(): AuthSettings["session"] {
    return this.getRequired<AuthSettings["session"]>("session");
  }

  getPasswordPolicy(): AuthSettings["password"] {
    return this.getRequired<AuthSettings["password"]>("password");
  }

  isOAuthProviderEnabled(provider: "google" | "github"): boolean {
    return this.get<boolean>(`oauth.${provider}.enabled`) || false;
  }
}
```

### Feature Flags Configuration

```typescript
// configs/app/FeatureFlags.ts
import { BaseConfiguration } from "../base/ConfigBase";
import { ConfigLoader } from "../base/ConfigLoader";

export interface FeatureFlags {
  enableUserRegistration: boolean;
  enablePasswordReset: boolean;
  enableOAuthLogin: boolean;
  enableProductReviews: boolean;
  enableRealTimeNotifications: boolean;
  enableAdvancedSearch: boolean;
  enableAnalytics: boolean;
  enableMaintenanceMode: boolean;
  enableBetaFeatures: boolean;
  maxFileUploadSize: number;
  maxProductsPerPage: number;
  enableCaching: boolean;
}

export class FeatureFlagsConfig extends BaseConfiguration {
  constructor() {
    const loader = ConfigLoader.getInstance();

    // Load feature flags from environment or config file
    const config: FeatureFlags = {
      enableUserRegistration:
        loader.getEnvVar("ENABLE_USER_REGISTRATION") === "true" ?? true,
      enablePasswordReset:
        loader.getEnvVar("ENABLE_PASSWORD_RESET") === "true" ?? true,
      enableOAuthLogin:
        loader.getEnvVar("ENABLE_OAUTH_LOGIN") === "true" ?? false,
      enableProductReviews:
        loader.getEnvVar("ENABLE_PRODUCT_REVIEWS") === "true" ?? true,
      enableRealTimeNotifications:
        loader.getEnvVar("ENABLE_REALTIME_NOTIFICATIONS") === "true" ?? false,
      enableAdvancedSearch:
        loader.getEnvVar("ENABLE_ADVANCED_SEARCH") === "true" ?? true,
      enableAnalytics:
        loader.getEnvVar("ENABLE_ANALYTICS") === "true" ??
        loader.isProduction(),
      enableMaintenanceMode:
        loader.getEnvVar("ENABLE_MAINTENANCE_MODE") === "true" ?? false,
      enableBetaFeatures:
        loader.getEnvVar("ENABLE_BETA_FEATURES") === "true" ??
        loader.isDevelopment(),
      maxFileUploadSize: parseInt(
        loader.getEnvVar("MAX_FILE_UPLOAD_SIZE") || "5242880"
      ), // 5MB default
      maxProductsPerPage: parseInt(
        loader.getEnvVar("MAX_PRODUCTS_PER_PAGE") || "50"
      ),
      enableCaching:
        loader.getEnvVar("ENABLE_CACHING") === "true" ?? loader.isProduction(),
    };

    super(config);
  }

  protected loadDefaults(): void {
    // Defaults are set in constructor
  }

  validate(): boolean {
    // Validate numeric limits
    const maxFileSize = this.get<number>("maxFileUploadSize");
    if (maxFileSize <= 0 || maxFileSize > 100 * 1024 * 1024) {
      // Max 100MB
      throw new Error("Invalid max file upload size");
    }

    const maxProductsPerPage = this.get<number>("maxProductsPerPage");
    if (maxProductsPerPage <= 0 || maxProductsPerPage > 200) {
      throw new Error("Invalid max products per page value");
    }

    return true;
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.get<boolean>(feature) || false;
  }

  getFeatureValue<T>(feature: keyof FeatureFlags): T {
    return this.get<T>(feature);
  }

  // Convenience methods
  canUserRegister(): boolean {
    return (
      this.isFeatureEnabled("enableUserRegistration") &&
      !this.isFeatureEnabled("enableMaintenanceMode")
    );
  }

  canResetPassword(): boolean {
    return this.isFeatureEnabled("enablePasswordReset");
  }

  isMaintenanceModeEnabled(): boolean {
    return this.isFeatureEnabled("enableMaintenanceMode");
  }

  getMaxFileUploadSize(): number {
    return this.getFeatureValue<number>("maxFileUploadSize");
  }

  getMaxProductsPerPage(): number {
    return this.getFeatureValue<number>("maxProductsPerPage");
  }
}
```

### Configuration Factory

```typescript
// configs/ConfigFactory.ts
import { AppConfig } from "./app/AppConfig";
import { ApiConfig } from "./api/ApiConfig";
import { AuthConfig } from "./auth/AuthConfig";
import { FeatureFlagsConfig } from "./app/FeatureFlags";

export class ConfigFactory {
  private static appConfig: AppConfig;
  private static apiConfig: ApiConfig;
  private static authConfig: AuthConfig;
  private static featureFlagsConfig: FeatureFlagsConfig;

  static getAppConfig(): AppConfig {
    if (!this.appConfig) {
      this.appConfig = new AppConfig();
    }
    return this.appConfig;
  }

  static getApiConfig(): ApiConfig {
    if (!this.apiConfig) {
      this.apiConfig = new ApiConfig();
    }
    return this.apiConfig;
  }

  static getAuthConfig(): AuthConfig {
    if (!this.authConfig) {
      this.authConfig = new AuthConfig();
    }
    return this.authConfig;
  }

  static getFeatureFlagsConfig(): FeatureFlagsConfig {
    if (!this.featureFlagsConfig) {
      this.featureFlagsConfig = new FeatureFlagsConfig();
    }
    return this.featureFlagsConfig;
  }

  static validateAllConfigs(): boolean {
    try {
      this.getAppConfig().validate();
      this.getApiConfig().validate();
      this.getAuthConfig().validate();
      this.getFeatureFlagsConfig().validate();
      return true;
    } catch (error) {
      console.error("Configuration validation failed:", error);
      return false;
    }
  }
}
```

## Environment Files

```bash
# .env.local (development)
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
SESSION_SECRET=your-session-secret-key

# OAuth configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Feature flags
ENABLE_USER_REGISTRATION=true
ENABLE_OAUTH_LOGIN=false
ENABLE_ANALYTICS=false
ENABLE_MAINTENANCE_MODE=false

# File upload limits
MAX_FILE_UPLOAD_SIZE=5242880
MAX_PRODUCTS_PER_PAGE=50
```

## Best Practices

1. **Environment Variables**: Sử dụng environment variables cho sensitive data
2. **Validation**: Validate tất cả configuration values
3. **Defaults**: Provide sensible defaults cho tất cả settings
4. **Type Safety**: Use TypeScript interfaces cho configuration types
5. **Factory Pattern**: Sử dụng factory pattern để manage configuration instances
6. **Feature Flags**: Implement feature flags cho controlled feature rollout
7. **Documentation**: Document tất cả configuration options

## Testing

```typescript
// configs/__tests__/AppConfig.test.ts
import { AppConfig } from "../app/AppConfig";

describe("AppConfig", () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.PORT = "3000";
    process.env.NODE_ENV = "test";
  });

  it("should load default configuration", () => {
    const config = new AppConfig();

    expect(config.getPort()).toBe(3000);
    expect(config.getEnvironment()).toBe("test");
    expect(config.getAppName()).toBeDefined();
  });

  it("should validate configuration", () => {
    const config = new AppConfig();
    expect(() => config.validate()).not.toThrow();
  });
});
```

## Lưu ý

- Configurations should be immutable sau khi load
- Sensitive data nên được stored trong environment variables
- Use validation để ensure configuration integrity
- Provide clear error messages khi configuration invalid
- Consider using config schemas for better validation
- Keep configurations environment-specific và secure
