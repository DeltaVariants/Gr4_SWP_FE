# Presentation Layouts

Thư mục này chứa các layout components cho ứng dụng Next.js theo Clean Architecture pattern.

## Mục đích

Presentation Layouts quản lý:

- Page layouts và structure
- Common UI elements (header, footer, sidebar)
- Navigation components
- Layout composition và nesting
- Responsive design patterns
- SEO và metadata management

## Cấu trúc và Quy ước

### Cấu trúc file

```
layouts/
├── base/
│   ├── BaseLayout.tsx          # Base layout với common elements
│   ├── BlankLayout.tsx         # Minimal layout (login, 404, etc.)
│   └── AuthLayout.tsx          # Authentication pages layout
├── app/
│   ├── AppLayout.tsx           # Main application layout
│   ├── DashboardLayout.tsx     # Admin dashboard layout
│   └── PublicLayout.tsx        # Public pages layout
├── components/
│   ├── Header.tsx              # Application header
│   ├── Footer.tsx              # Application footer
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Breadcrumb.tsx          # Breadcrumb navigation
│   └── Navigation.tsx          # Main navigation menu
├── providers/
│   ├── LayoutProvider.tsx      # Layout context provider
│   └── ThemeProvider.tsx       # Theme management
└── types/
    ├── LayoutTypes.ts          # Layout-related types
    └── NavigationTypes.ts      # Navigation types
```

### Quy ước đặt tên

- Layout components: `AppLayout`, `DashboardLayout`
- Layout components sử dụng suffix `Layout`
- Common components: `Header`, `Footer`, `Sidebar`
- PascalCase cho component names

## Ví dụ Implementation

### Base Layout

```typescript
// layouts/base/BaseLayout.tsx
import React from "react";
import Head from "next/head";
import { LayoutProps } from "../types/LayoutTypes";

export interface BaseLayoutProps extends LayoutProps {
  title?: string;
  description?: string;
  keywords?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  title = "SWP391 Application",
  description = "Default description for SWP391 application",
  keywords = "swp391, next.js, react, typescript",
  noIndex = false,
  canonicalUrl,
  className = "",
}) => {
  const fullTitle = title ? `${title} | SWP391 App` : "SWP391 App";

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph tags */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />

        {/* SEO tags */}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>

      <div className={`min-h-screen bg-gray-50 ${className}`}>{children}</div>
    </>
  );
};
```

### App Layout

```typescript
// layouts/app/AppLayout.tsx
import React, { useState } from "react";
import { BaseLayout, BaseLayoutProps } from "../base/BaseLayout";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/Sidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { useAuth } from "../../../application/hooks/useAuth";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";

export interface AppLayoutProps extends BaseLayoutProps {
  showSidebar?: boolean;
  showBreadcrumb?: boolean;
  sidebarCollapsed?: boolean;
  requireAuth?: boolean;
  allowedRoles?: string[];
  loading?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  showBreadcrumb = true,
  sidebarCollapsed: initialCollapsed = false,
  requireAuth = true,
  allowedRoles = [],
  loading = false,
  ...baseProps
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading || loading) {
    return (
      <BaseLayout {...baseProps}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }

  // Redirect to login if authentication required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <BaseLayout {...baseProps}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">
              Please log in to access this page.
            </p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Check role permissions
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <BaseLayout {...baseProps}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <BaseLayout {...baseProps}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            user={user}
          />
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            showSidebar ? (sidebarCollapsed ? "ml-16" : "ml-64") : ""
          } transition-all duration-300`}
        >
          {/* Header */}
          <Header
            user={user}
            showSidebarToggle={showSidebar}
            onSidebarToggle={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <Breadcrumb />
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </BaseLayout>
  );
};
```

### Public Layout

```typescript
// layouts/app/PublicLayout.tsx
import React from "react";
import { BaseLayout, BaseLayoutProps } from "../base/BaseLayout";
import { PublicHeader } from "../components/PublicHeader";
import { Footer } from "../components/Footer";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";

export interface PublicLayoutProps extends BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  containerized?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  containerized = true,
  ...baseProps
}) => {
  return (
    <BaseLayout {...baseProps}>
      <div className="min-h-screen flex flex-col">
        {/* Public Header */}
        {showHeader && <PublicHeader />}

        {/* Main Content */}
        <main className="flex-1">
          <ErrorBoundary>
            {containerized ? (
              <div className="container mx-auto px-4 py-8">{children}</div>
            ) : (
              children
            )}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </BaseLayout>
  );
};
```

### Authentication Layout

```typescript
// layouts/base/AuthLayout.tsx
import React from "react";
import { BaseLayout, BaseLayoutProps } from "./BaseLayout";
import { Logo } from "../../components/ui/Logo";

export interface AuthLayoutProps extends BaseLayoutProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  ...baseProps
}) => {
  return (
    <BaseLayout {...baseProps} noIndex>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          {showLogo && (
            <div className="text-center">
              <Logo className="mx-auto h-12 w-auto" />
              {title && (
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          )}

          {/* Auth Form Container */}
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
```

### Header Component

```typescript
// layouts/components/Header.tsx
import React from "react";
import { User } from "../../../domain/entities/User";
import { UserDropdown } from "./UserDropdown";
import { NotificationDropdown } from "./NotificationDropdown";
import { SearchBar } from "../../components/ui/SearchBar";

export interface HeaderProps {
  user: User | null;
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  showSidebarToggle = false,
  onSidebarToggle,
  sidebarCollapsed = false,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          {showSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Search Bar */}
          <div className="hidden md:block">
            <SearchBar
              placeholder="Search..."
              onSearch={(query) => console.log("Search:", query)}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Toggle */}
          <button className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          {user && <UserDropdown user={user} />}
        </div>
      </div>
    </header>
  );
};
```

### Sidebar Component

```typescript
// layouts/components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "../../../domain/entities/User";
import { Logo } from "../../components/ui/Logo";
import { NavigationItem } from "../types/NavigationTypes";

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  user,
}) => {
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
      roles: ["admin", "manager", "user"],
    },
    {
      label: "Users",
      href: "/users",
      icon: "users",
      roles: ["admin", "manager"],
    },
    {
      label: "Products",
      href: "/products",
      icon: "products",
      roles: ["admin", "manager"],
    },
    {
      label: "Orders",
      href: "/orders",
      icon: "orders",
      roles: ["admin", "manager"],
    },
    {
      label: "Settings",
      href: "/settings",
      icon: "settings",
      roles: ["admin"],
    },
  ];

  const filteredItems = navigationItems.filter(
    (item) => !item.roles || !user || item.roles.includes(user.role)
  );

  const isActiveRoute = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-gray-900 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <Logo
          variant="light"
          size={collapsed ? "sm" : "md"}
          showText={!collapsed}
        />
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <div className="px-2 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActiveRoute(item.href)
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <NavigationIcon
                icon={item.icon}
                className={`flex-shrink-0 h-6 w-6 ${collapsed ? "" : "mr-3"}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Info (when not collapsed) */}
      {!collapsed && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-300 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-4 -right-3 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`h-4 w-4 text-gray-600 transition-transform ${
            collapsed ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>
  );
};

// Navigation Icon Component
const NavigationIcon: React.FC<{ icon: string; className: string }> = ({
  icon,
  className,
}) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"
        />
      </svg>
    ),
    users: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    products: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    orders: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    settings: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  };

  return icons[icon] || icons.dashboard;
};
```

### Layout Types

```typescript
// layouts/types/LayoutTypes.ts
import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
  badge?: string | number;
  subItems?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface LayoutConfig {
  showSidebar: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showBreadcrumb: boolean;
  requireAuth: boolean;
  allowedRoles: string[];
  sidebarCollapsed: boolean;
}
```

## Best Practices

1. **Composition**: Compose layouts từ reusable components
2. **Responsive**: Ensure layouts work trên tất cả screen sizes
3. **Accessibility**: Implement proper ARIA labels và keyboard navigation
4. **Performance**: Lazy load layout components khi có thể
5. **SEO**: Proper meta tags và structured data
6. **Error Boundaries**: Wrap content trong error boundaries
7. **Type Safety**: Use TypeScript interfaces cho tất cả props

## Testing

```typescript
// layouts/__tests__/AppLayout.test.tsx
import { render, screen } from "@testing-library/react";
import { AppLayout } from "../app/AppLayout";
import { useAuth } from "../../../application/hooks/useAuth";

// Mock useAuth hook
jest.mock("../../../application/hooks/useAuth");

describe("AppLayout", () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "John Doe", role: "user" },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("should render children when authenticated", () => {
    render(
      <AppLayout title="Test Page">
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should show login prompt when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <AppLayout requireAuth>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText("Authentication Required")).toBeInTheDocument();
  });
});
```

## Lưu ý

- Layout components nên được reusable và composable
- Implement responsive design patterns
- Handle authentication và authorization logic
- Provide proper SEO meta tags
- Use error boundaries để handle layout errors
- Consider performance implications của layout re-renders
- Make layouts accessible với proper ARIA attributes
