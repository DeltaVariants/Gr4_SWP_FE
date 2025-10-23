import React from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  header?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "outlined" | "elevated" | "filled";
  color?: string;
  borderRadius?: number | string;
  shadow?: boolean | string;
  onClick?: () => void;
  hoverable?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  orientation = "vertical",
  header,
  actions,
  variant = "outlined",
  color = "bg-white",
  borderRadius = "rounded-lg",
  shadow = true,
  onClick,
  hoverable = false,
  loading = false,
}) => {
  const shadowClass = shadow
    ? typeof shadow === "string"
      ? shadow
      : "shadow-md"
    : "";
  const hoverClass = hoverable ? "hover:shadow-lg hover:scale-105" : "";
  const variantClass =
    variant === "outlined"
      ? "border border-gray-300"
      : variant === "elevated"
      ? "shadow-lg"
      : "bg-gray-100";

  return (
    <div
      className={`flex ${
        orientation === "horizontal" ? "flex-row" : "flex-col"
      } ${color} ${borderRadius} ${shadowClass} ${hoverClass} ${variantClass} transition-transform duration-200 ease-in-out`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <>
          {header && (
            <div className="p-4 border-b border-gray-200">{header}</div>
          )}
          <div className="p-4">
            {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            )}
            <div>{children}</div>
          </div>
          {actions && (
            <div className="p-4 border-t border-gray-200">{actions}</div>
          )}
        </>
      )}
    </div>
  );
};
