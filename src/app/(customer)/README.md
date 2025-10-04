# Customer Route Group - (customer)

Route group cho Customer Portal, cung cấp giao diện khách hàng với các tính năng self-service và quản lý tài khoản.

## Mục đích

Customer Portal bao gồm:

- Đăng ký và đăng nhập tài khoản
- Duyệt và tìm kiếm sản phẩm/dịch vụ
- Đặt hàng và theo dõi đơn hàng
- Quản lý thông tin cá nhân
- Lịch sử giao dịch và hóa đơn
- Hỗ trợ khách hàng và feedback

## Cấu trúc Route dự kiến

### Routing Structure

```
(customer)/
├── layout.tsx                      # Customer layout với header/footer
├── page.tsx                        # Customer home/dashboard
├── auth/
│   ├── login/
│   │   └── page.tsx               # Customer login
│   ├── register/
│   │   └── page.tsx               # Customer registration
│   ├── forgot-password/
│   │   └── page.tsx               # Password reset request
│   └── reset-password/
│       └── page.tsx               # Password reset form
├── dashboard/
│   ├── page.tsx                    # Customer dashboard
│   ├── profile/
│   │   ├── page.tsx               # Profile overview
│   │   ├── edit/
│   │   │   └── page.tsx           # Edit profile
│   │   └── security/
│   │       └── page.tsx           # Security settings
│   ├── orders/
│   │   ├── page.tsx               # Orders history
│   │   ├── [orderId]/
│   │   │   └── page.tsx           # Order detail
│   │   └── tracking/
│   │       └── page.tsx           # Order tracking
│   ├── addresses/
│   │   ├── page.tsx               # Saved addresses
│   │   ├── add/
│   │   │   └── page.tsx           # Add new address
│   │   └── [addressId]/
│   │       └── edit/
│   │           └── page.tsx       # Edit address
│   └── payment-methods/
│       ├── page.tsx               # Saved payment methods
│       └── add/
│           └── page.tsx           # Add payment method
├── products/
│   ├── page.tsx                    # Products catalog
│   ├── [categorySlug]/
│   │   └── page.tsx               # Category products
│   ├── [productSlug]/
│   │   └── page.tsx               # Product detail
│   └── search/
│       └── page.tsx               # Search results
├── services/
│   ├── page.tsx                    # Services catalog
│   ├── [serviceSlug]/
│   │   ├── page.tsx               # Service detail
│   │   └── book/
│   │       └── page.tsx           # Service booking
│   └── appointments/
│       ├── page.tsx               # Appointments list
│       ├── book/
│       │   └── page.tsx           # New appointment
│       └── [appointmentId]/
│           ├── page.tsx           # Appointment detail
│           └── reschedule/
│               └── page.tsx       # Reschedule appointment
├── cart/
│   ├── page.tsx                    # Shopping cart
│   └── checkout/
│       ├── page.tsx               # Checkout process
│       ├── shipping/
│       │   └── page.tsx           # Shipping information
│       ├── payment/
│       │   └── page.tsx           # Payment information
│       └── confirmation/
│           └── page.tsx           # Order confirmation
├── support/
│   ├── page.tsx                    # Help center
│   ├── contact/
│   │   └── page.tsx               # Contact form
│   ├── faq/
│   │   └── page.tsx               # FAQ page
│   ├── tickets/
│   │   ├── page.tsx               # Support tickets
│   │   ├── create/
│   │   │   └── page.tsx           # Create ticket
│   │   └── [ticketId]/
│   │       └── page.tsx           # Ticket detail
│   └── chat/
│       └── page.tsx               # Live chat
├── notifications/
│   ├── page.tsx                    # Notifications center
│   └── settings/
│       └── page.tsx               # Notification settings
└── wishlist/
    └── page.tsx                   # Wishlist/favorites
```

## Ví dụ Implementation

### Customer Layout

```typescript
// (customer)/layout.tsx
import { Metadata } from "next";
import { CustomerHeader } from "../../presentation/layouts/CustomerHeader";
import { CustomerFooter } from "../../presentation/layouts/CustomerFooter";
import { CartProvider } from "../../presentation/providers/CartProvider";
import { WishlistProvider } from "../../presentation/providers/WishlistProvider";
import { getCurrentUser } from "../../application/services/AuthService";

export const metadata: Metadata = {
  title: {
    template: "%s | SWP391 Shop",
    default: "SWP391 Shop - Premium Products & Services",
  },
  description:
    "Discover premium products and services with exceptional customer experience",
  keywords: ["shop", "products", "services", "customer", "online shopping"],
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <CustomerHeader user={user} />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <CustomerFooter />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
```

### Customer Dashboard

```typescript
// (customer)/dashboard/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "../../../application/services/AuthService";
import { CustomerStats } from "../../../presentation/components/features/dashboard/CustomerStats";
import { RecentOrders } from "../../../presentation/components/features/orders/RecentOrders";
import { RecommendedProducts } from "../../../presentation/components/features/products/RecommendedProducts";
import { AccountOverview } from "../../../presentation/components/features/account/AccountOverview";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Customer dashboard with account overview and recent activity",
};

export default async function CustomerDashboard() {
  const user = await getCurrentUser();

  // Redirect if not authenticated
  if (!user) {
    redirect("/customer/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName || user.name}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Account Stats */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <CustomerStats userId={user.id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Orders
            </h2>
            <Suspense
              fallback={
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <RecentOrders userId={user.id} limit={5} />
            </Suspense>
          </section>

          {/* Recommended Products */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recommended for You
            </h2>
            <Suspense
              fallback={
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <RecommendedProducts userId={user.id} limit={8} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Account Overview */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Overview
            </h2>
            <AccountOverview user={user} />
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/customer/orders"
                className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="text-blue-700 font-medium">View Orders</span>
                </div>
              </a>

              <a
                href="/customer/support/contact"
                className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-green-700 font-medium">
                    Contact Support
                  </span>
                </div>
              </a>

              <a
                href="/customer/wishlist"
                className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-purple-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-purple-700 font-medium">
                    My Wishlist
                  </span>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
```

### Customer Registration

```typescript
// (customer)/auth/register/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CustomerRegisterForm } from "../../../../presentation/components/features/auth/CustomerRegisterForm";
import { getCurrentUser } from "../../../../application/services/AuthService";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join us and start shopping for premium products and services",
};

export default async function CustomerRegisterPage() {
  const user = await getCurrentUser();

  // Redirect if already authenticated
  if (user) {
    redirect("/customer/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/customer/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <CustomerRegisterForm
            onSuccess={() => redirect("/customer/dashboard")}
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Why create an account?
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center justify-center">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Faster checkout process
            </li>
            <li className="flex items-center justify-center">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Order tracking and history
            </li>
            <li className="flex items-center justify-center">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Exclusive offers and discounts
            </li>
            <li className="flex items-center justify-center">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Wishlist and recommendations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### Products Catalog

```typescript
// (customer)/products/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { ProductsGrid } from "../../../presentation/components/features/products/ProductsGrid";
import { ProductsFilters } from "../../../presentation/components/features/products/ProductsFilters";
import { ProductsSort } from "../../../presentation/components/features/products/ProductsSort";
import { BreadcrumbNav } from "../../../presentation/components/common/BreadcrumbNav";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our collection of premium products",
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    rating?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const {
    page = "1",
    category,
    search,
    sort = "newest",
    minPrice,
    maxPrice,
    brand,
    rating,
  } = searchParams;

  const currentPage = Number(page);

  const breadcrumbs = [
    { label: "Home", href: "/customer" },
    { label: "Products", href: "/customer/products" },
    ...(category
      ? [{ label: category, href: `/customer/products?category=${category}` }]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbs} />

      {/* Page Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? `${category} Products` : "All Products"}
        </h1>
        {search && (
          <p className="mt-2 text-lg text-gray-600">
            Search results for "{search}"
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <ProductsFilters
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              brand={brand}
              rating={rating}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Sort and View Options */}
          <div className="flex items-center justify-between mb-6">
            <ProductsSort currentSort={sort} />

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing page {currentPage}
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <ProductsGrid
              page={currentPage}
              category={category}
              search={search}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              brand={brand}
              rating={rating}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### Shopping Cart

```typescript
// (customer)/cart/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CartItems } from "../../../presentation/components/features/cart/CartItems";
import { CartSummary } from "../../../presentation/components/features/cart/CartSummary";
import { RecommendedProducts } from "../../../presentation/components/features/products/RecommendedProducts";
import { BreadcrumbNav } from "../../../presentation/components/common/BreadcrumbNav";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your selected items before checkout",
};

export default function CartPage() {
  const breadcrumbs = [
    { label: "Home", href: "/customer" },
    { label: "Cart", href: "/customer/cart" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbs} />

      {/* Page Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <CartItems />
          </Suspense>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Suspense
              fallback={
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <CartSummary />
            </Suspense>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/customer/products"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You might also like
        </h2>
        <Suspense
          fallback={
            <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          }
        >
          <RecommendedProducts limit={8} />
        </Suspense>
      </div>
    </div>
  );
}
```

## Features & Components

### Authentication

- **CustomerLoginForm**: Email/password login với social auth options
- **CustomerRegisterForm**: Multi-step registration với email verification
- **ForgotPasswordForm**: Password reset request với email
- **ResetPasswordForm**: New password setup với token validation

### Dashboard & Account

- **CustomerStats**: Order count, spending, loyalty points
- **AccountOverview**: Profile summary với quick edit options
- **ProfileSettings**: Personal information management
- **SecuritySettings**: Password change, 2FA setup

### Shopping Experience

- **ProductsGrid**: Responsive product listing với infinite scroll
- **ProductCard**: Product display với quick actions
- **ProductDetail**: Detailed product view với reviews
- **ProductSearch**: Advanced search với filters

### Cart & Checkout

- **CartItems**: Shopping cart management với quantity updates
- **CartSummary**: Price calculation với taxes and shipping
- **CheckoutProcess**: Multi-step checkout với validation
- **PaymentMethods**: Secure payment integration

### Orders & Tracking

- **OrderHistory**: Paginated orders list với search
- **OrderDetail**: Comprehensive order information
- **OrderTracking**: Real-time shipping updates
- **OrderActions**: Cancel, return, review options

### Support & Help

- **ContactForm**: Support ticket creation
- **LiveChat**: Real-time customer support
- **FAQSection**: Organized help articles
- **TicketTracker**: Support ticket management

## User Experience Features

### Personalization

- Product recommendations based on browsing history
- Personalized homepage content
- Saved preferences và settings
- Wishlist và favorites management

### Shopping Assistance

- Recently viewed products
- Product comparison tools
- Size và fit guides
- Stock notifications

### Mobile Optimization

- Touch-friendly interface
- Mobile-optimized checkout
- App-like navigation
- Offline browsing capabilities

## Security & Privacy

### Data Protection

- Secure payment processing
- Personal information encryption
- GDPR compliance
- Cookie consent management

### Account Security

- Strong password requirements
- Two-factor authentication
- Session management
- Login attempt monitoring

## Best Practices

### Performance

1. **Image Optimization**: Next.js Image component với lazy loading
2. **Code Splitting**: Dynamic imports cho large components
3. **Caching**: Implement proper caching strategies
4. **SEO**: Server-side rendering cho product pages

### Accessibility

1. **Keyboard Navigation**: Full keyboard accessibility
2. **Screen Reader Support**: Proper ARIA labels
3. **Color Contrast**: WCAG compliant color schemes
4. **Focus Management**: Clear focus indicators

### User Experience

1. **Loading States**: Provide feedback during data loading
2. **Error Handling**: Graceful error recovery
3. **Responsive Design**: Mobile-first approach
4. **Progressive Enhancement**: Work without JavaScript

## Testing Strategy

```typescript
// (customer)/auth/login/__tests__/page.test.tsx
import { render, screen } from "@testing-library/react";
import { getCurrentUser } from "../../../../../application/services/AuthService";
import CustomerLoginPage from "../page";

jest.mock("../../../../../application/services/AuthService");
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("CustomerLoginPage", () => {
  it("should render login form when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    render(<CustomerLoginPage />);

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("should redirect when already authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "1",
      email: "customer@example.com",
      role: "CUSTOMER",
    });

    // Test redirect behavior
    // This would require mocking Next.js redirect
  });
});
```

## Lưu ý

- Customer routes hỗ trợ cả authenticated và public access
- Implement proper SEO cho product pages
- Use Server Components cho static content
- Client Components cho interactive features
- Implement proper error boundaries
- Optimize performance cho mobile devices
- Provide offline functionality where possible
- Regular A/B testing cho conversion optimization
