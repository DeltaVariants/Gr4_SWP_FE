# App Directory - Next.js App Router

Thư mục `app` chứa toàn bộ routing structure của ứng dụng Next.js sử dụng App Router (Next.js 13+).

## Mục đích

App Directory cung cấp:

- File-based routing với App Router
- Route groups để tổ chức theo roles/features
- Shared layouts và nested routing
- Server và Client Components
- API routes và middleware
- Loading, error, và not-found states

## Cấu trúc và Quy ước

### Cấu trúc hiện tại

```
app/
├── favicon.ico                     # App favicon
├── globals.css                     # Global CSS styles
├── layout.tsx                      # Root layout component
├── page.tsx                        # Homepage component
├── (admin)/                        # Admin route group
├── (customer)/                     # Customer route group
└── (employee)/                     # Employee route group
```

### File Conventions trong App Router

#### Special Files

- `layout.tsx`: Shared UI cho route segment và children
- `page.tsx`: UI duy nhất cho route và public accessible
- `loading.tsx`: Loading UI cho route segment và children
- `error.tsx`: Error UI cho route segment và children
- `not-found.tsx`: Not found UI cho route segment và children
- `route.tsx`: Server-side API endpoint

#### Metadata Files

- `favicon.ico`, `icon.png`, `apple-icon.png`: App icons
- `opengraph-image.png`, `twitter-image.png`: Social media images
- `robots.txt`, `sitemap.xml`: SEO files

## Ví dụ Implementation

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../presentation/providers/Providers";
import { ErrorBoundary } from "../presentation/components/common/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SWP391 Project",
    template: "%s | SWP391 Project",
  },
  description: "Next.js application with Clean Architecture",
  keywords: ["Next.js", "React", "TypeScript", "Clean Architecture"],
  authors: [{ name: "SWP391 Team" }],
  creator: "SWP391 Team",
  publisher: "SWP391 Team",
  metadataBase: new URL("https://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://localhost:3000",
    title: "SWP391 Project",
    description: "Next.js application with Clean Architecture",
    siteName: "SWP391 Project",
  },
  twitter: {
    card: "summary_large_image",
    title: "SWP391 Project",
    description: "Next.js application with Clean Architecture",
    creator: "@swp391team",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Providers>
            <div id="root">{children}</div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Homepage

```typescript
// app/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../application/services/AuthService";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to SWP391 Project",
};

export default async function HomePage() {
  // Server-side authentication check
  const user = await getCurrentUser();

  // Redirect authenticated users to their dashboard
  if (user) {
    switch (user.role) {
      case "ADMIN":
        redirect("/admin/dashboard");
      case "EMPLOYEE":
        redirect("/employee/dashboard");
      case "CUSTOMER":
        redirect("/customer/dashboard");
      default:
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SWP391 Project
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern web application built with Next.js, TypeScript, and Clean
            Architecture principles.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg
                className="h-12 w-12"
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
            <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive admin dashboard for system management and user
              administration.
            </p>
            <Link
              href="/admin/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Admin Login →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 mb-4">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Employee Portal</h3>
            <p className="text-gray-600 mb-4">
              Employee dashboard for task management and internal operations.
            </p>
            <Link
              href="/employee/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Employee Login →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-purple-600 mb-4">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer Portal</h3>
            <p className="text-gray-600 mb-4">
              Customer-facing interface for services and account management.
            </p>
            <Link
              href="/customer/login"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Customer Login →
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Choose your role to access the appropriate portal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign Up as Customer
            </Link>
            <Link
              href="/about"
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: "Inter", sans-serif;
}

/* Base styles */
@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-white text-gray-900;
  }

  * {
    @apply border-border;
  }
}

/* Component styles */
@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }

  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .form-error {
    @apply text-sm text-red-600 mt-1;
  }
}

/* Utility styles */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .transition-base {
    @apply transition-all duration-200 ease-in-out;
  }

  .gradient-primary {
    @apply bg-gradient-to-r from-blue-600 to-indigo-600;
  }

  .gradient-secondary {
    @apply bg-gradient-to-r from-gray-600 to-gray-800;
  }

  .shadow-primary {
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.15);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* Focus styles */
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Animation utilities */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  body {
    @apply text-black bg-white;
  }

  .card {
    @apply shadow-none border border-gray-400;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Route Groups

### (admin) - Admin Portal

- **Mục đích**: Quản lý hệ thống, người dùng, và cấu hình
- **Authentication**: Yêu cầu role ADMIN
- **Layout**: Admin-specific sidebar và navigation
- **Features**: User management, system settings, analytics

### (customer) - Customer Portal

- **Mục đích**: Giao diện khách hàng, đăng ký dịch vụ
- **Authentication**: Public routes + authenticated customer areas
- **Layout**: Customer-friendly navigation và branding
- **Features**: Service browsing, account management, orders

### (employee) - Employee Portal

- **Mục đích**: Công cụ làm việc cho nhân viên
- **Authentication**: Yêu cầu role EMPLOYEE
- **Layout**: Task-focused interface
- **Features**: Task management, reporting, internal tools

## Best Practices

### File Organization

1. **Route Groups**: Sử dụng `(groupName)` để organize routes theo features
2. **Nested Layouts**: Tận dụng nested layouts cho shared UI
3. **Co-location**: Đặt components gần với routes sử dụng chúng
4. **Special Files**: Sử dụng đúng naming conventions cho loading, error states

### Performance

1. **Server Components**: Sử dụng Server Components by default
2. **Client Components**: Chỉ sử dụng khi cần interactivity
3. **Dynamic Imports**: Lazy load components không cần thiết
4. **Image Optimization**: Sử dụng Next.js Image component

### SEO & Metadata

1. **Dynamic Metadata**: Generate metadata based on page content
2. **Structured Data**: Implement JSON-LD schema markup
3. **Sitemap**: Auto-generate sitemap.xml
4. **Robots.txt**: Configure search engine crawling

### Security

1. **Authentication**: Implement proper auth checks
2. **Authorization**: Role-based access control
3. **CSRF Protection**: Use Next.js built-in CSRF protection
4. **Input Validation**: Validate all user inputs

## Routing Examples

### Static Routes

```
/                           → app/page.tsx
/about                      → app/about/page.tsx
/contact                    → app/contact/page.tsx
```

### Dynamic Routes

```
/admin/users/[id]           → app/(admin)/users/[id]/page.tsx
/customer/orders/[orderId]  → app/(customer)/orders/[orderId]/page.tsx
/employee/tasks/[taskId]    → app/(employee)/tasks/[taskId]/page.tsx
```

### Nested Routes với Layouts

```
/admin                      → app/(admin)/layout.tsx + page.tsx
/admin/dashboard           → app/(admin)/dashboard/page.tsx
/admin/users               → app/(admin)/users/page.tsx
/admin/users/create        → app/(admin)/users/create/page.tsx
```

## Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Testing

```typescript
// app/__tests__/page.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("HomePage", () => {
  it("should render homepage correctly", () => {
    render(<HomePage />);

    expect(screen.getByText("Welcome to SWP391 Project")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Employee Portal")).toBeInTheDocument();
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
  });

  it("should have correct navigation links", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: /admin login/i })).toHaveAttribute(
      "href",
      "/admin/login"
    );
    expect(
      screen.getByRole("link", { name: /employee login/i })
    ).toHaveAttribute("href", "/employee/login");
    expect(
      screen.getByRole("link", { name: /customer login/i })
    ).toHaveAttribute("href", "/customer/login");
  });
});
```

## Lưu ý

- App Directory sử dụng Server Components by default
- Route groups `(groupName)` không ảnh hưởng đến URL structure
- Layouts được shared giữa các routes trong cùng segment
- Special files có naming conventions cố định
- Metadata có thể được generate dynamically
- Performance optimization thông qua RSC và streaming
- SEO-friendly với built-in metadata support
