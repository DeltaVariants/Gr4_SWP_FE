import React from "react";

interface AdminInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email" | "password" | "tel";
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  step?: string;
  min?: string | number;
  max?: string | number;
  className?: string;
  hideSpinner?: boolean;
}

export const AdminInput: React.FC<AdminInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required = false,
  disabled = false,
  step,
  min,
  max,
  className = "",
  hideSpinner = false,
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-800 ${
          hideSpinner
            ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            : ""
        } ${error ? "border-red-500" : "border-gray-300"}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
