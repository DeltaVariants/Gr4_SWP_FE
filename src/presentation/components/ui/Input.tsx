import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  leftIcon,
  rightIcon,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const baseInputClasses =
    "w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className={`relative ${containerClassName}`}>
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}

      <input
        className={`${baseInputClasses} ${leftIcon ? "pl-10" : ""} ${
          rightIcon ? "pr-10" : ""
        } ${className}`}
        {...props}
      />

      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
};
