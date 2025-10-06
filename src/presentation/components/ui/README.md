# Presentation Components - UI

Thư mục này chứa các reusable UI components cơ bản được sử dụng trong toàn bộ ứng dụng.

## Mục đích

UI Components bao gồm:

- Basic building blocks (buttons, inputs, cards)
- Layout components (grids, containers, spacers)
- Navigation components (breadcrumbs, pagination, tabs)
- Data display components (tables, lists, badges)
- Feedback components (alerts, notifications, progress)
- Form components (input fields, select boxes, checkboxes)

## Cấu trúc và Quy ước

### Cấu trúc file theo category

```
ui/
├── Button/                         # Button components
│   ├── Button.tsx
│   ├── ButtonGroup.tsx
│   ├── IconButton.tsx
│   └── __tests__/
├── Input/                          # Input components
│   ├── Input.tsx
│   ├── TextArea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   └── __tests__/
├── Card/                           # Card components
│   ├── Card.tsx
│   ├── CardHeader.tsx
│   ├── CardBody.tsx
│   ├── CardFooter.tsx
│   └── __tests__/
├── Table/                          # Table components
│   ├── Table.tsx
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   ├── TableCell.tsx
│   └── __tests__/
├── Navigation/                     # Navigation components
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   ├── Tabs.tsx
│   └── __tests__/
├── Feedback/                       # Feedback components
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Progress.tsx
│   └── __tests__/
└── Layout/                         # Layout components
    ├── Container.tsx
    ├── Grid.tsx
    ├── Spacer.tsx
    └── __tests__/
```

### Quy ước đặt tên

- PascalCase cho component names
- Compound components: `Card`, `CardHeader`, `CardBody`
- Descriptive variants: `PrimaryButton`, `SecondaryButton`
- Generic names cho maximum reusability

## Ví dụ Implementation

### Button Components

#### Base Button

```typescript
// ui/Button/Button.tsx
import React, { forwardRef } from "react";
import { LoadingSpinner } from "../common/LoadingStates";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent",
  secondary:
    "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border-transparent",
  outline:
    "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
  ghost:
    "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500 border-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} disabled={isDisabled} className={classes} {...props}>
        {loading && (
          <LoadingSpinner
            size={size === "xs" || size === "sm" ? "sm" : "md"}
            color="gray"
            className="mr-2"
          />
        )}

        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}

        <span>{children}</span>

        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
```

#### Button Group

```typescript
// ui/Button/ButtonGroup.tsx
import React from "react";

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  spacing?: "none" | "sm" | "md";
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = "horizontal",
  spacing = "sm",
  className = "",
}) => {
  const baseClasses = "inline-flex";

  const orientationClasses = {
    horizontal: "flex-row",
    vertical: "flex-col",
  };

  const spacingClasses = {
    none: "",
    sm: orientation === "horizontal" ? "space-x-2" : "space-y-2",
    md: orientation === "horizontal" ? "space-x-4" : "space-y-4",
  };

  const classes = [
    baseClasses,
    orientationClasses[orientation],
    spacingClasses[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group">
      {children}
    </div>
  );
};
```

### Input Components

#### Base Input

```typescript
// ui/Input/Input.tsx
import React, { forwardRef, useState } from "react";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "default" | "filled" | "flushed";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  variant?: InputVariant;
  error?: string;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

const variantClasses: Record<InputVariant, string> = {
  default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white",
  filled:
    "border-transparent focus:border-blue-500 focus:ring-blue-500 bg-gray-50",
  flushed:
    "border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none bg-transparent px-0",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "default",
      error,
      helperText,
      label,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [inputId] = useState(
      id || `input-${Math.random().toString(36).substr(2, 9)}`
    );

    const baseClasses =
      "block rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "",
      fullWidth ? "w-full" : "",
      leftIcon || leftAddon ? "pl-10" : "",
      rightIcon || rightAddon ? "pr-10" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Addon */}
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              <span className="px-3 text-gray-500 text-sm bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                {leftAddon}
              </span>
            </div>
          )}

          {/* Left Icon */}
          {leftIcon && !leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{leftIcon}</span>
            </div>
          )}

          {/* Input Field */}
          <input ref={ref} id={inputId} className={classes} {...props} />

          {/* Right Icon */}
          {rightIcon && !rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}

          {/* Right Addon */}
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <span className="px-3 text-gray-500 text-sm bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                {rightAddon}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

#### Select Component

```typescript
// ui/Input/Select.tsx
import React, { forwardRef, useState } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  size?: "sm" | "md" | "lg";
  error?: string;
  helperText?: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      size = "md",
      error,
      helperText,
      label,
      placeholder,
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [selectId] = useState(
      id || `select-${Math.random().toString(36).substr(2, 9)}`
    );

    const baseClasses =
      "block rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

    const classes = [
      baseClasses,
      sizeClasses[size],
      error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select ref={ref} id={selectId} className={classes} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
```

### Card Components

#### Base Card

```typescript
// ui/Card/Card.tsx
import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantClasses = {
  elevated: "bg-white shadow-md border border-gray-200",
  outlined: "bg-white border border-gray-300",
  filled: "bg-gray-50 border border-gray-200",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "elevated",
      padding = "md",
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const classes = [
      "rounded-lg",
      variantClasses[variant],
      paddingClasses[padding],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
```

#### Card Header

```typescript
// ui/Card/CardHeader.tsx
import React from "react";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
  ...props
}) => {
  const classes = [
    "flex items-center justify-between pb-4 border-b border-gray-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {children}
      </div>

      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};
```

### Table Components

#### Base Table

```typescript
// ui/Table/Table.tsx
import React from "react";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: "simple" | "striped" | "bordered";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantClasses = {
  simple: "",
  striped: "[&_tbody_tr:nth-child(odd)]:bg-gray-50",
  bordered: "border border-gray-300",
};

const sizeClasses = {
  sm: "[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 text-sm",
  md: "[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3",
  lg: "[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4 text-lg",
};

export const Table: React.FC<TableProps> = ({
  variant = "simple",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const classes = [
    "min-w-full divide-y divide-gray-200",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <table className={classes} {...props}>
        {children}
      </table>
    </div>
  );
};
```

### Navigation Components

#### Pagination

```typescript
// ui/Navigation/Pagination.tsx
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  className = "",
}) => {
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push("...");
      }
    }

    // Add page numbers around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  const PageButton: React.FC<{
    page: number | string;
    isActive?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
  }> = ({ page, isActive, disabled, onClick, children }) => {
    const baseClasses =
      "relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors";
    const activeClasses = isActive
      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50";
    const disabledClasses = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${activeClasses} ${disabledClasses} border`}
      >
        {children}
      </button>
    );
  };

  return (
    <nav className={`flex items-center justify-center ${className}`}>
      <div className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        {/* First Page */}
        {showFirstLast && currentPage > 1 && (
          <PageButton
            page={1}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">First</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </PageButton>
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <PageButton
            page={currentPage - 1}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </PageButton>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) =>
          typeof pageNumber === "number" ? (
            <PageButton
              key={pageNumber}
              page={pageNumber}
              isActive={pageNumber === currentPage}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </PageButton>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              {pageNumber}
            </span>
          )
        )}

        {/* Next Page */}
        {showPrevNext && (
          <PageButton
            page={currentPage + 1}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </PageButton>
        )}

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages && (
          <PageButton
            page={totalPages}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Last</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm-6 0a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </PageButton>
        )}
      </div>
    </nav>
  );
};
```

### Feedback Components

#### Alert Component

```typescript
// ui/Feedback/Alert.tsx
import React from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    container: "bg-blue-50 border-blue-200",
    icon: "text-blue-400",
    title: "text-blue-800",
    content: "text-blue-700",
    closeButton: "text-blue-500 hover:text-blue-600",
    iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  success: {
    container: "bg-green-50 border-green-200",
    icon: "text-green-400",
    title: "text-green-800",
    content: "text-green-700",
    closeButton: "text-green-500 hover:text-green-600",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200",
    icon: "text-yellow-400",
    title: "text-yellow-800",
    content: "text-yellow-700",
    closeButton: "text-yellow-500 hover:text-yellow-600",
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z",
  },
  error: {
    container: "bg-red-50 border-red-200",
    icon: "text-red-400",
    title: "text-red-800",
    content: "text-red-700",
    closeButton: "text-red-500 hover:text-red-600",
    iconPath:
      "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  onClose,
  className = "",
}) => {
  const config = variantConfig[variant];

  return (
    <div className={`border rounded-md p-4 ${config.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${config.icon}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={config.iconPath}
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.content}`}>{children}</div>
        </div>

        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${config.closeButton} hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors`}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Design System Integration

```typescript
// ui/theme/tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: "#eff6ff",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      300: "#d1d5db",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      900: "#111827",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
};
```

## Best Practices

1. **Consistency**: Follow design system tokens và patterns
2. **Accessibility**: Implement proper ARIA attributes, keyboard navigation, và color contrast
3. **Reusability**: Design components để có thể compose và extend
4. **Performance**: Use React.memo cho stable components
5. **Type Safety**: Strong TypeScript interfaces cho tất cả props
6. **Testing**: Comprehensive unit tests với accessibility testing
7. **Documentation**: Clear examples và usage guidelines
8. **Theming**: Support multiple themes và customization

## Testing

```typescript
// ui/Button/__tests__/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("should render with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should show loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should apply variant styles correctly", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });
});
```

## Lưu ý

- UI components nên được generic và highly reusable
- Follow design system tokens và patterns consistently
- Implement comprehensive accessibility features
- Use compound component patterns khi appropriate
- Provide flexible APIs với sensible defaults
- Keep components focused và single-responsibility
- Support theming và customization options
- Document usage patterns và examples clearly
