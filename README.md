<!-- prettier-ignore -->
src/
 ├─ app/                      # Next.js app router (entrypoints)
 │   ├─ (marketing)/
 │   ├─ (dashboard)/
 │   └─ layout.tsx
 │
 ├─ presentation/             # UI layer
 │   ├─ components/           # Shared UI components
 │   │   ├─ ui/               # Atoms (Button, Input, Card...)
 │   │   ├─ common/           # Reusable composite (Header, Footer...)
 │   │   └─ feature/          # Feature-specific (Chart, ProfileForm...)
 │   ├─ layouts/              # Layout components
 │   └─ hooks/                # UI hooks (e.g. useTheme, useFormInput)
 │
 ├─ application/              # App services (use cases, state management)
 │   ├─ services/             
 │   ├─ slices/               # Redux/RTK slices hoặc Zustand store
 │   └─ usecases/             
 │
 ├─ domain/                   # Pure business logic (no React, no fetch)
 │   ├─ entities/             # Entities (User, Order...)
 │   ├─ dto/                  # Data Transfer Objects
 │   └─ repositories/         # Interface definitions (e.g. IUserRepo)
 │
 ├─ infrastructure/           # Implementation of external stuff
 │   ├─ api/                  # API clients (axios, fetch wrappers)
 │   ├─ repositories/         # Repo implementation (calls API)
 │   └─ config/               # env, constants, db config
 │
 └─ shared/                   # Shared code across layers
     ├─ lib/                  # Utilities (date, format...)
     └─ constants/
