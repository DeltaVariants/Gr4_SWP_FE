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

## Lưu ý

- Repository implementations thuộc về infrastructure layer
- Implement proper error handling và mapping
- Use caching strategies để improve performance
- Provide mock implementations cho testing
- Keep repositories focused on data access, không chứa business logic
- Use mappers để convert giữa entities và DTOs
- Consider offline capabilities với local storage repositories
