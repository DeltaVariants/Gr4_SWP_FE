"use client";
import { useState, useRef, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";

export interface ActionItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  color?: "default" | "danger" | "warning" | "success";
  className?: string;
}

interface ActionsProps {
  items: ActionItem[];
  onOpen?: () => void;
  onClose?: () => void;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}

export function Actions({
  items,
  onOpen,
  onClose,
  size = "md",
  align = "right",
}: ActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      onOpen?.();
    } else {
      onClose?.();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onOpen, onClose]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: ActionItem) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "danger":
        return "text-red-600 hover:bg-red-50";
      case "warning":
        return "text-yellow-600 hover:bg-yellow-50";
      case "success":
        return "text-green-600 hover:bg-green-50";
      default:
        return "text-gray-700 hover:bg-gray-50";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  const getButtonClasses = () => {
    const baseClasses =
      "rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200";
    switch (size) {
      case "sm":
        return `${baseClasses} p-1`;
      case "lg":
        return `${baseClasses} p-3`;
      default:
        return `${baseClasses} p-2`;
    }
  };

  const getDropdownPosition = () => {
    return align === "left" ? "left-0" : "right-0";
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={getButtonClasses()}
        aria-label="Actions menu"
        type="button"
      >
        <FaEllipsisV size={getIconSize()} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute ${getDropdownPosition()} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-dropdown`}
          style={{
            animation: "dropdownFadeIn 0.2s ease-out",
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="relative group">
              <button
                onClick={handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : getColorClasses(item.color)
                } ${item.className || ""}`}
                type="button"
              >
                {item.label}
              </button>

              {/* Tooltip */}
              {item.tooltip && !item.disabled && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  {item.tooltip}
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
