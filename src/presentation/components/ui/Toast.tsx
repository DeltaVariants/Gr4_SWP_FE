"use client";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  isVisible,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-500",
          text: "text-green-800",
          icon: <FaCheckCircle className="text-green-500 text-xl" />,
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          text: "text-red-800",
          icon: <FaExclamationCircle className="text-red-500 text-xl" />,
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-500",
          text: "text-yellow-800",
          icon: <FaExclamationCircle className="text-yellow-500 text-xl" />,
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-500",
          text: "text-blue-800",
          icon: <FaInfoCircle className="text-blue-500 text-xl" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div
        className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3`}
      >
        <div className="shrink-0">{styles.icon}</div>
        <div className={`flex-1 ${styles.text}`}>
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
          aria-label="Close notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

// Hook để sử dụng Toast dễ dàng hơn
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}
