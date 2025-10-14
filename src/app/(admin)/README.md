# Admin Route Group - (admin)

Route group cho Admin Portal, cung cấp giao diện quản trị hệ thống với đầy đủ quyền hạn quản lý.

## Mục đích

Admin Portal bao gồm:

- Quản lý người dùng và phân quyền
- Thống kê và báo cáo hệ thống
- Cấu hình hệ thống và settings
- Giám sát hoạt động và logs
- Quản lý nội dung và dữ liệu
- Backup và maintenance tools

## Cấu trúc Route dự kiến

### Routing Structure

```
(admin)/
├── layout.tsx                      # Admin layout với sidebar
├── page.tsx                        # Admin dashboard redirect
├── login/
│   └── page.tsx                    # Admin login page
├── dashboard/
│   ├── page.tsx                    # Dashboard overview
│   ├── analytics/
│   │   └── page.tsx               # Detailed analytics
│   └── reports/
│       ├── page.tsx               # Reports list
│       └── [reportId]/
│           └── page.tsx           # Report detail
├── users/
│   ├── page.tsx                    # Users list
│   ├── create/
│   │   └── page.tsx               # Create user
│   ├── [id]/
│   │   ├── page.tsx               # User detail
│   │   └── edit/
│   │       └── page.tsx           # Edit user
│   └── roles/
│       ├── page.tsx               # Roles management
│       └── [roleId]/
│           └── page.tsx           # Role detail
├── content/
│   ├── page.tsx                    # Content management
│   ├── posts/
│   │   ├── page.tsx               # Posts list
│   │   ├── create/
│   │   │   └── page.tsx           # Create post
│   │   └── [id]/
│   │       ├── page.tsx           # Post detail
│   │       └── edit/
│   │           └── page.tsx       # Edit post
│   └── media/
│       ├── page.tsx               # Media library
│       └── upload/
│           └── page.tsx           # Upload media
├── settings/
│   ├── page.tsx                    # General settings
│   ├── system/
│   │   └── page.tsx               # System configuration
│   ├── security/
│   │   └── page.tsx               # Security settings
│   └── integrations/
│       ├── page.tsx               # Integrations list
│       └── [integration]/
│           └── page.tsx           # Integration config
├── logs/
│   ├── page.tsx                    # Activity logs
│   ├── errors/
│   │   └── page.tsx               # Error logs
│   └── audit/
│       └── page.tsx               # Audit trail
└── profile/
    ├── page.tsx                    # Admin profile
    └── security/
        └── page.tsx               # Security settings
```

## Ví dụ Implementation

### Admin Layout

```typescript
// (admin)/layout.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "../../presentation/layouts/AdminSidebar";
import { AdminHeader } from "../../presentation/layouts/AdminHeader";
import { ProtectedRoute } from "../../presentation/components/common/ProtectedRoute";
import { getCurrentUser } from "../../application/services/AuthService";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Panel",
    default: "Admin Panel",
  },
  description: "Administrative panel for system management",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect if not authenticated or not admin
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <AdminHeader user={user} />

        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 p-6 ml-64">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### Admin Dashboard

```typescript
// (admin)/dashboard/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { DashboardStats } from "../../../presentation/components/features/dashboard/DashboardStats";
import { RecentActivity } from "../../../presentation/components/features/dashboard/RecentActivity";
import { SystemHealth } from "../../../presentation/components/features/dashboard/SystemHealth";
import { QuickActions } from "../../../presentation/components/features/dashboard/QuickActions";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard with system overview and statistics",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your system today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <QuickActions />
        </div>
      </div>

      {/* Dashboard Stats */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <DashboardStats timeRange="month" />
      </Suspense>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
          }
        >
          <SystemHealth />
        </Suspense>

        <Suspense
          fallback={
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
          }
        >
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
```

### Admin Login Page

```typescript
// (admin)/login/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "../../../presentation/components/features/auth/AdminLoginForm";
import { getCurrentUser } from "../../../application/services/AuthService";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the administrative panel",
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();

  // Redirect if already authenticated as admin
  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the administrative panel
          </p>
        </div>

        {/* Login Form */}
        <AdminLoginForm
          onSuccess={() => redirect("/admin/dashboard")}
          className="mt-8 space-y-6"
        />

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            For security reasons, admin access is restricted and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Users Management

```typescript
// (admin)/users/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { UsersTable } from "../../../presentation/components/features/users/UsersTable";
import { UsersFilters } from "../../../presentation/components/features/users/UsersFilters";
import { TableSkeleton } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Users Management",
  description: "Manage system users and their permissions",
};

interface UsersPageProps {
  searchParams: {
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  };
}

export default function UsersPage({ searchParams }: UsersPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const searchTerm = searchParams.search || "";
  const roleFilter = searchParams.role || "";
  const statusFilter = searchParams.status || "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/admin/users/create"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add User
          </Link>
        </div>
      </div>

      {/* Filters */}
      <UsersFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
      />

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <Suspense
          fallback={<TableSkeleton rows={10} columns={6} className="p-6" />}
        >
          <UsersTable
            page={currentPage}
            search={searchTerm}
            role={roleFilter}
            status={statusFilter}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

## Authentication & Authorization

### Middleware Protection

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request });

    // Allow access to login page
    if (pathname === "/admin/login") {
      // Redirect if already authenticated as admin
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Check authentication and role
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

## Features & Components

### Dashboard Components

- **DashboardStats**: System metrics và KPIs
- **RecentActivity**: Recent user actions và system events
- **SystemHealth**: Server status, database health, service monitoring
- **QuickActions**: Shortcut buttons for common admin tasks

### User Management

- **UsersTable**: Paginated users list với sorting và filtering
- **UserForm**: Create/edit user với role assignment
- **RoleManagement**: Role-based permissions configuration
- **UserProfile**: Detailed user information và activity history

### Content Management

- **PostsManagement**: Blog posts, announcements, news management
- **MediaLibrary**: File upload, organization, và optimization
- **ContentEditor**: Rich text editor với preview functionality

### System Configuration

- **SystemSettings**: Application configuration, feature flags
- **SecuritySettings**: Authentication settings, password policies
- **IntegrationsConfig**: Third-party service configurations
- **BackupManagement**: Database backup và restore functionality

## Security Features

### Access Control

- Role-based permissions (RBAC)
- Route-level protection
- API endpoint authorization
- Audit logging for admin actions

### Security Monitoring

- Failed login attempt tracking
- Session management và timeout
- IP restriction capabilities
- Security event notifications

### Data Protection

- Input validation và sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation

## Best Practices

### UI/UX Guidelines

1. **Consistent Layout**: Maintain consistent sidebar và header across pages
2. **Loading States**: Show appropriate loading indicators for data fetching
3. **Error Handling**: Provide clear error messages với recovery options
4. **Confirmation Dialogs**: Require confirmation for destructive actions
5. **Breadcrumbs**: Help admins navigate complex nested routes

### Performance

1. **Server Components**: Leverage RSC for data-heavy admin pages
2. **Pagination**: Implement proper pagination for large datasets
3. **Caching**: Cache frequently accessed admin data
4. **Optimistic Updates**: Provide immediate feedback for user actions

### Security

1. **Input Validation**: Validate all admin inputs thoroughly
2. **Audit Logging**: Log all administrative actions
3. **Session Security**: Implement secure session management
4. **Regular Updates**: Keep dependencies updated for security

## Testing Strategy

```typescript
// (admin)/dashboard/__tests__/page.test.tsx
import { render, screen } from "@testing-library/react";
import { getCurrentUser } from "../../../../application/services/AuthService";
import AdminDashboard from "../page";

// Mock services
jest.mock("../../../../application/services/AuthService");
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("AdminDashboard", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue({
      id: "1",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin User",
    });
  });

  it("should render dashboard correctly", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });

  it("should display dashboard stats", async () => {
    render(<AdminDashboard />);

    // Check for stats components
    expect(screen.getByTestId("dashboard-stats")).toBeInTheDocument();
  });
});
```

## Lưu ý

- Admin routes yêu cầu authentication và role ADMIN
- Tất cả admin actions should be logged for audit purposes
- Implement proper error boundaries for admin components
- Use Server Components cho data-heavy admin pages
- Provide comprehensive search và filtering capabilities
- Implement real-time notifications cho critical system events
- Regular security reviews và penetration testing
- Backup và recovery procedures cho admin data
