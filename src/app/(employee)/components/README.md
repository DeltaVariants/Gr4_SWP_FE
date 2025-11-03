# Employee Components

This folder contains all components specific to the employee/staff routes.

## Structure

```
components/
├── Table.tsx      # Staff-specific table component
└── StatCard.tsx   # Staff dashboard stat card
```

## Usage

These components are only used within the `(employee)` route group for:
- Dashboard staff
- Inventory management
- Reservations
- Reports
- Swap operations

For shared UI components, use `@/presentation/components/ui/`.
