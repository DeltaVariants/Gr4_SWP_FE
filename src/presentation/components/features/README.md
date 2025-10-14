# Presentation Components - Features

Thư mục này chứa các feature-specific components được tổ chức theo từng domain business.

## Mục đích

Feature Components bao gồm:

- Business domain specific components
- Feature pages và containers
- Domain-related forms và modals
- Feature-specific UI patterns
- Connected components with business logic
- Complex interaction components

## Cấu trúc và Quy ước

### Cấu trúc thư mục theo domain

```
features/
├── auth/                           # Authentication features
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── __tests__/
├── users/                          # User management features
│   ├── UserList.tsx
│   ├── UserCard.tsx
│   ├── UserProfile.tsx
│   ├── UserForm.tsx
│   └── __tests__/
├── products/                       # Product management features
│   ├── ProductList.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetail.tsx
│   ├── ProductForm.tsx
│   ├── ProductSearch.tsx
│   └── __tests__/
├── orders/                         # Order management features
│   ├── OrderList.tsx
│   ├── OrderCard.tsx
│   ├── OrderDetail.tsx
│   ├── CheckoutForm.tsx
│   └── __tests__/
└── dashboard/                      # Dashboard features
    ├── DashboardStats.tsx
    ├── RecentActivity.tsx
    ├── AnalyticsChart.tsx
    └── __tests__/
```

### Quy ước đặt tên

- PascalCase cho component names
- Descriptive names reflecting business purpose
- Suffix pattern: `List`, `Card`, `Detail`, `Form`, `Modal`
- Group related components in feature folders

## Ví dụ Implementation

### Authentication Features

#### Login Form

```typescript
// features/auth/LoginForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../../application/hooks/useAuth";
import { LoginRequest } from "../../../domain/dto/auth/LoginRequest";
import { LoadingSpinner } from "../common/LoadingStates";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  className = "",
}) => {
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginRequest: LoginRequest = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };

      await login(loginRequest);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setError("root", { message: err.message });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <div className="mt-1">
          <input
            {...register("email")}
            type="email"
            id="email"
            autoComplete="email"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            {...register("password")}
            type="password"
            id="password"
            autoComplete="current-password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register("rememberMe")}
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      {/* Display errors */}
      {(error || errors.root) && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error || errors.root?.message}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="gray" className="mr-2" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </form>
  );
};
```

### Product Features

#### Product List

```typescript
// features/products/ProductList.tsx
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../application/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { ProductSearch } from "./ProductSearch";
import { LoadingSpinner, TableSkeleton } from "../common/LoadingStates";
import { NoData, NoSearchResults } from "../common/NoData";
import { ErrorBoundary } from "../common/ErrorBoundary";

export interface ProductListProps {
  categoryId?: string;
  onProductSelect?: (productId: string) => void;
  className?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  categoryId,
  onProductSelect,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const {
    products,
    isLoading,
    error,
    totalCount,
    searchProducts,
    clearSearch,
  } = useProducts({
    categoryId,
    page: currentPage,
    pageSize,
  });

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    if (term.trim()) {
      await searchProducts(term);
    } else {
      clearSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    clearSearch();
  };

  // Handle pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg
            className="h-12 w-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold">Error loading products</h3>
          <p className="text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={className}>
        {/* Search */}
        <div className="mb-6">
          <ProductSearch
            value={searchTerm}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search products..."
          />
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <span>
                Found {totalCount} result{totalCount !== 1 ? "s" : ""} for "
                {searchTerm}"
              </span>
            ) : (
              <span>
                Showing {totalCount} product{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <TableSkeleton rows={4} columns={1} />
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductSelect?.(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Empty states */}
        {!isLoading && products.length === 0 && (
          <>
            {searchTerm ? (
              <NoSearchResults
                searchTerm={searchTerm}
                onClear={handleClearSearch}
              />
            ) : (
              <NoData
                title="No products found"
                message="There are no products available at the moment."
                icon={
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                }
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};
```

#### Product Card

```typescript
// features/products/ProductCard.tsx
import React, { useState } from "react";
import Image from "next/image";
import { Product } from "../../../domain/entities/Product";
import { formatCurrency } from "../../../application/utils/formatters";

export interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onAddToCart,
  onToggleFavorite,
  className = "",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50">
        {!imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadingComplete={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Loading overlay */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Discount badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
        >
          <svg
            className={`h-5 w-5 ${
              product.isFavorite ? "text-red-500 fill-current" : "text-gray-400"
            }`}
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
        </button>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.category && (
          <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`h-4 w-4 ${
                    index < Math.floor(product.rating!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock indicator */}
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-sm text-orange-600 mb-3">
            Only {product.stock} left in stock
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
```

### Dashboard Features

#### Dashboard Stats

```typescript
// features/dashboard/DashboardStats.tsx
import React from "react";
import { useDashboardStats } from "../../../application/hooks/useDashboardStats";
import { LoadingSpinner, Skeleton } from "../common/LoadingStates";
import {
  formatCurrency,
  formatNumber,
} from "../../../application/utils/formatters";

export interface DashboardStatsProps {
  className?: string;
  timeRange?: "today" | "week" | "month" | "year";
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  className = "",
  timeRange = "month",
}) => {
  const { stats, isLoading, error } = useDashboardStats(timeRange);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading dashboard statistics</p>
      </div>
    );
  }

  const statItems = stats
    ? [
        {
          name: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          change: stats.revenueChange,
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          ),
          color: "text-green-600",
        },
        {
          name: "Total Orders",
          value: formatNumber(stats.totalOrders),
          change: stats.ordersChange,
          icon: (
            <svg
              className="h-6 w-6"
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
          ),
          color: "text-blue-600",
        },
        {
          name: "New Customers",
          value: formatNumber(stats.newCustomers),
          change: stats.customersChange,
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
          color: "text-purple-600",
        },
        {
          name: "Conversion Rate",
          value: `${stats.conversionRate.toFixed(1)}%`,
          change: stats.conversionRateChange,
          icon: (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          color: "text-orange-600",
        },
      ]
    : [];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {isLoading
        ? // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton height={16} width="60%" className="mb-2" />
                  <Skeleton height={24} width="80%" className="mb-2" />
                  <Skeleton height={14} width="40%" />
                </div>
                <Skeleton height={40} width={40} rounded />
              </div>
            </div>
          ))
        : // Actual stats
          statItems.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {item.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </p>
                  {item.change !== undefined && (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center text-sm font-medium ${
                          item.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.change >= 0 ? (
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 17l9.2-9.2M17 17V7H7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 7l-9.2 9.2M7 7v10h10"
                            />
                          </svg>
                        )}
                        {Math.abs(item.change).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        vs last {timeRange}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${item.color}`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};
```

## Best Practices

1. **Domain Organization**: Group components theo business domains
2. **Business Logic Integration**: Connect với application hooks và services
3. **State Management**: Use proper state management patterns
4. **Form Handling**: Implement robust form validation và error handling
5. **Data Loading**: Handle loading states và error states properly
6. **User Experience**: Provide feedback và smooth interactions
7. **Accessibility**: Implement proper ARIA attributes và keyboard navigation
8. **Performance**: Optimize với React.memo, useMemo, và lazy loading

## Testing

```typescript
// features/auth/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";
import { useAuth } from "../../../../application/hooks/useAuth";

// Mock the useAuth hook
jest.mock("../../../../application/hooks/useAuth");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("LoginForm", () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      user: null,
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form correctly", () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        rememberMe: false,
      });
    });
  });

  it("should show validation errors for invalid data", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });
});
```

## Lưu ý

- Feature components should focus on specific business domains
- Connect với application layer thông qua hooks
- Implement proper error handling và loading states
- Use TypeScript để ensure type safety
- Provide comprehensive testing coverage
- Follow consistent naming conventions
- Keep components focused và maintainable
- Optimize performance cho complex interactions
